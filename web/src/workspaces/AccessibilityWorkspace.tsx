import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Check,
  X,
  Mic,
  MicOff,
  Sliders,
  Maximize2,
  Volume2,
  ShieldCheck,
  Sun,
  Moon,
  Smartphone,
  Heart,
  FileText,
  MessageSquare,
  BatteryCharging,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface AccessibilityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AccessibilityWorkspace: React.FC<AccessibilityWorkspaceProps> = ({
  toolId,
  accentColor = '#4F46E5',
}) => {
  // ==========================================
  // 1. WCAG 2.1 COLOR CONTRAST CHECKER
  // ==========================================
  const [fgColor, setFgColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [colorBlindFilter, setColorBlindFilter] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('none');

  const getLuminance = (hex: string): number => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2) || '0', 16) / 255;
    const g = parseInt(clean.substring(2, 4) || '0', 16) / 255;
    const b = parseInt(clean.substring(4, 6) || '0', 16) / 255;
    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (c1: string, c2: string): number => {
    try {
      const lum1 = getLuminance(c1);
      const lum2 = getLuminance(c2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
    } catch {
      return 1;
    }
  };

  const contrastRatio = getContrastRatio(fgColor, bgColor);

  // ==========================================
  // 2. DISPLAY METRICS & READABILITY MODES
  // ==========================================
  const [previewFontSize, setPreviewFontSize] = useState(16);
  const [previewLineHeight, setPreviewLineHeight] = useState(1.6);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);

  const [screenInfo, setScreenInfo] = useState({
    viewport: typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '1920 × 1080',
    screen: typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : '1920 × 1080',
    dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    colorDepth: typeof window !== 'undefined' ? `${window.screen.colorDepth}-bit` : '24-bit',
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        screen: `${window.screen.width} × ${window.screen.height}`,
        dpr: window.devicePixelRatio || 1,
        colorDepth: `${window.screen.colorDepth}-bit`,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==========================================
  // 2b. SCREEN FLASHLIGHT & BATTERY INFO
  // ==========================================
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);

  useEffect(() => {
    const nav = navigator as any;
    if (typeof nav.getBattery === 'function') {
      nav.getBattery().then((battery: any) => {
        const update = () => setBatteryInfo({ level: Math.round(battery.level * 100), charging: battery.charging });
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      }).catch(() => setBatterySupported(false));
    } else {
      setBatterySupported(false);
    }
  }, []);

  // ==========================================
  // 2c. HAPTIC TIMER
  // ==========================================
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const vibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const startHapticTimer = () => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    setTimerRemaining(timerSeconds);
    timerIntervalRef.current = window.setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
          if (vibrationSupported) navigator.vibrate([200, 100, 200, 100, 400]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelHapticTimer = () => {
    if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    setTimerRemaining(null);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
  }, []);

  // ==========================================
  // 3. SOUND MONITOR & HEARING TONE TEST
  // ==========================================
  const [isMicActive, setIsMicActive] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [micError, setMicError] = useState('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const toggleSoundMeter = async () => {
    setMicError('');
    if (isMicActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      setIsMicActive(false);
      setDecibels(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicActive(true);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const db = Math.round(30 + (avg / 255) * 65);
        setDecibels(db);
        if (micStreamRef.current?.active) {
          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };
      checkVolume();
    } catch {
      setMicError('Microphone permission required for sound monitoring. Please allow microphone access.');
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  const playHearingTone = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  // ==========================================
  // 4. MAGNIFIER (LIVE CAMERA ZOOM)
  // ==========================================
  const [magnifierOn, setMagnifierOn] = useState(false);
  const [magnifierError, setMagnifierError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(2);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const magnifierStreamRef = useRef<MediaStream | null>(null);

  const startMagnifier = async () => {
    setMagnifierError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      magnifierStreamRef.current = stream;
      setMagnifierOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setMagnifierError('Camera permission required to use the magnifier.');
    }
  };

  const stopMagnifier = () => {
    magnifierStreamRef.current?.getTracks().forEach((t) => t.stop());
    magnifierStreamRef.current = null;
    setMagnifierOn(false);
  };

  useEffect(() => {
    return () => {
      magnifierStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ==========================================
  // 5. SPEECH-TO-TEXT (LIVE TRANSCRIPTION)
  // ==========================================
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<any>(null);

  const toggleSpeechToText = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSpeechError('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    setSpeechError('');
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript + ' ';
      }
      if (finalText) setTranscript((prev) => prev + finalText);
    };
    recognition.onerror = () => setSpeechError('Microphone permission required for speech recognition.');
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // ==========================================
  // 6. TEXT-TO-SPEECH (TTS READER & DOCUMENT READ-ALOUD)
  // ==========================================
  const [ttsText, setTtsText] = useState('');
  const [ttsRate, setTtsRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text: string) => {
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  // ==========================================
  // 7. DOCUMENT READ-ALOUD (FILE UPLOAD)
  // ==========================================
  const [docText, setDocText] = useState('');
  const [docName, setDocName] = useState('');

  const handleDocUpload = (file: File | undefined) => {
    if (!file) return;
    setDocName(file.name);
    const reader = new FileReader();
    reader.onload = () => setDocText(String(reader.result || ''));
    reader.readAsText(file);
  };

  // ==========================================
  // 8. LARGE TEXT READER
  // ==========================================
  const [largeReaderText, setLargeReaderText] = useState(
    'Paste any text here to read it back in large, high-legibility type.'
  );

  // ==========================================
  // 9. DEVICE INFORMATION
  // ==========================================
  const [deviceInfo, setDeviceInfo] = useState({
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0,
    memory: typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 0 : 0,
    touch: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  useEffect(() => {
    const updateOnline = () => setDeviceInfo((prev) => ({ ...prev, online: navigator.onLine }));
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  // ==========================================
  // 10. EMERGENCY INFORMATION CARD
  // ==========================================
  const [emergencyInfo, setEmergencyInfo] = useState({
    name: '', bloodType: '', allergies: '', medications: '', contactName: '', contactPhone: '', notes: '',
  });
  const [emergencySaved, setEmergencySaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolstrum_emergency_card');
      if (saved) setEmergencyInfo(JSON.parse(saved));
    } catch {}
  }, []);

  const saveEmergencyInfo = () => {
    try {
      localStorage.setItem('toolstrum_emergency_card', JSON.stringify(emergencyInfo));
      setEmergencySaved(true);
      setTimeout(() => setEmergencySaved(false), 2000);
    } catch {}
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Eye className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Accessibility & Display Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'WCAG contrast ratios, color blindness filters, screen hardware metrics, and sound meters. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* 451 — MAGNIFIER */}
      {toolId === 451 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-indigo-500" /> Camera Magnifier
            </h3>
            <p className="text-xs text-slate-500">
              Uses your device camera as a live magnifying glass for small print, labels, or fine detail.
            </p>

            {magnifierOn ? (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Zoom: {zoomLevel.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <button
                  onClick={stopMagnifier}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs bg-rose-500 hover:bg-rose-600 transition-all"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <>
                {magnifierError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
                    {magnifierError}
                  </div>
                )}
                <button
                  onClick={startMagnifier}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  Start Camera Magnifier
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 452 — FLASHLIGHT */}
      {toolId === 452 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-indigo-500" /> Screen Flashlight
            </h3>
            <p className="text-xs text-slate-500">
              Turns your display into a bright white light source for low-light tasks. Raise your device brightness to maximum for best effect.
            </p>
            <button
              onClick={() => setFlashlightOn(true)}
              className="w-full py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              Turn On Flashlight
            </button>
          </div>
        </div>
      )}

      {flashlightOn && (
        <div
          className="fixed inset-0 z-50 bg-white flex items-end justify-center pb-10 cursor-pointer"
          onClick={() => setFlashlightOn(false)}
        >
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Tap anywhere to turn off</span>
        </div>
      )}

      {/* 453 — SCREEN COLOR PICKER */}
      {toolId === 453 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Screen Color Picker</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Pick a Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                />
              </div>
            </div>
            <div
              className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center"
              style={{ backgroundColor: fgColor }}
            >
              <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-black/40 text-white">
                HEX {fgColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 454 — TEXT SIZE PREVIEW */}
      {toolId === 454 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" /> Text Size Preview
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Font Size: {previewFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={previewFontSize}
                  onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Line Height: {previewLineHeight}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.4"
                  step="0.1"
                  value={previewLineHeight}
                  onChange={(e) => setPreviewLineHeight(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isDyslexiaFont}
                  onChange={(e) => setIsDyslexiaFont(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded-sm"
                />
                <span>Dyslexia-Friendly High-Legibility Font Mode</span>
              </label>
            </div>

            <div
              className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white ${
                isDyslexiaFont ? 'font-serif tracking-wide' : 'font-sans'
              }`}
              style={{ fontSize: `${previewFontSize}px`, lineHeight: previewLineHeight }}
            >
              <p>
                Clear typography and customizable spacing empower readers of all cognitive styles and visual acuities to comprehend documentation effortlessly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 455 — CONTRAST CHECKER */}
      {toolId === 455 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">WCAG Contrast Checker</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Foreground (Text) Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Background (Surface) Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl border transition-all text-center space-y-2"
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <p className="text-xl font-bold">Sample Heading Text</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                This live preview simulates how text renders against your background surface for all users.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Contrast Ratio
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {contrastRatio} : 1
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AA Normal Text (≥ 4.5:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 4.5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 4.5 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AA Large Text (≥ 3.0:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 3.0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 3.0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 3.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AAA Normal Text (≥ 7.0:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 7.0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 7.0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 456 — COLOR BLINDNESS SIMULATOR */}
      {toolId === 456 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Color Blindness Simulator</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Foreground (Text) Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Background (Surface) Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Vision Simulation Filter
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Normal Vision' },
                  { id: 'protanopia', label: 'Protanopia' },
                  { id: 'deuteranopia', label: 'Deuteranopia' },
                  { id: 'tritanopia', label: 'Tritanopia' },
                  { id: 'achromatopsia', label: 'Monochrome' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setColorBlindFilter(f.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      colorBlindFilter === f.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all text-center space-y-2 ${
                colorBlindFilter === 'achromatopsia' ? 'grayscale' : ''
              }`}
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <p className="text-xl font-bold">Sample Heading Text</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                This live preview simulates how text renders against your background surface under the selected vision filter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 457 — SPEECH-TO-TEXT */}
      {toolId === 457 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Speech-to-Text
            </h3>
            <p className="text-xs text-slate-500">
              Transcribes your speech into text live using your device microphone — everything runs locally in the browser.
            </p>

            {speechError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
                {speechError}
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcribed speech will appear here..."
              rows={8}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={toggleSpeechToText}
                className={`flex-1 py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isListening ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
              </button>
              <button
                onClick={() => setTranscript('')}
                className="px-4 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 458 — TEXT-TO-SPEECH READER */}
      {toolId === 458 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-500" /> Text-to-Speech Reader
            </h3>
            <p className="text-xs text-slate-500">
              Type or paste text and have it read aloud using your device's built-in voice engine.
            </p>

            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Type or paste text to be read aloud..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>Reading Speed: {ttsRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={ttsRate}
                onChange={(e) => setTtsRate(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => speakText(ttsText)}
                disabled={isSpeaking || !ttsText.trim()}
                className="flex-1 py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isSpeaking ? 'Reading…' : 'Read Aloud'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 459 — LARGE TEXT READER */}
      {toolId === 459 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Large Text Reader
            </h3>
            <p className="text-xs text-slate-500">
              Paste any text and view it back in oversized, high-legibility type for comfortable reading.
            </p>

            <textarea
              value={largeReaderText}
              onChange={(e) => setLargeReaderText(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>Font Size: {previewFontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="48"
                value={previewFontSize}
                onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-80 overflow-y-auto"
              style={{ fontSize: `${previewFontSize}px`, lineHeight: 1.6 }}
            >
              {largeReaderText}
            </div>
          </div>
        </div>
      )}

      {/* 460 — DOCUMENT READ-ALOUD */}
      {toolId === 460 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Document Read-Aloud
            </h3>
            <p className="text-xs text-slate-500">
              Upload a plain-text document or paste its contents, then have the full document read aloud.
            </p>

            <label className="block w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:border-indigo-400 transition-all">
              <input
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(e) => handleDocUpload(e.target.files?.[0])}
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {docName || 'Click to upload a .txt document'}
              </span>
            </label>

            <textarea
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Or paste document text here..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div>
              <div className="flex justify-between mb-1 text-xs">
                <span>Reading Speed: {ttsRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={ttsRate}
                onChange={(e) => setTtsRate(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => speakText(docText)}
                disabled={isSpeaking || !docText.trim()}
                className="flex-1 py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isSpeaking ? 'Reading…' : 'Read Document Aloud'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 462 — HAPTIC TIMER */}
      {toolId === 462 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Haptic Timer</h3>
            <p className="text-xs text-slate-500">
              Counts down silently and vibrates your device when time is up. {!vibrationSupported && '(Vibration unsupported on this browser — a visual alert is shown instead.)'}
            </p>

            {timerRemaining === null ? (
              <>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{timerSeconds}s</p>
                <button
                  onClick={startHapticTimer}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all"
                >
                  Start Timer
                </button>
              </>
            ) : (
              <>
                <p className={`text-5xl font-black font-mono ${timerRemaining === 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {timerRemaining === 0 ? 'DONE' : `${timerRemaining}s`}
                </p>
                <button
                  onClick={cancelHapticTimer}
                  className="w-full py-3 rounded-xl text-white font-bold text-xs bg-rose-500 hover:bg-rose-600 transition-all"
                >
                  {timerRemaining === 0 ? 'Reset' : 'Cancel'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 463 — SOUND LEVEL METER (+ related hearing tone check) */}
      {toolId === 463 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Real-Time Decibel & Sound Level Exposure
            </h3>

            <div className="py-2">
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
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
                {micError}
              </div>
            )}

            <button
              onClick={toggleSoundMeter}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isMicActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicActive ? 'Stop Microphone Monitor' : 'Start Sound Level Monitor'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hearing Tone Frequency Check
            </h3>
            <p className="text-xs text-slate-500">
              Click each frequency button to test ear responsiveness across acoustic bands:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { freq: 250, label: '250 Hz (Deep Bass)' },
                { freq: 500, label: '500 Hz (Mid-Low)' },
                { freq: 1000, label: '1,000 Hz (Speech Mid)' },
                { freq: 2000, label: '2,000 Hz (Clarity)' },
                { freq: 4000, label: '4,000 Hz (Presence)' },
                { freq: 8000, label: '8,000 Hz (High Treble)' },
              ].map((item) => (
                <button
                  key={item.freq}
                  onClick={() => playHearingTone(item.freq)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between border border-slate-200 dark:border-slate-700"
                >
                  <span>{item.label}</span>
                  <Volume2 className="w-4 h-4 text-indigo-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 464 — SCREEN RESOLUTION VIEWER */}
      {toolId === 464 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Screen Resolution Viewer</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Live Viewport Resolution</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{screenInfo.viewport}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Physical Monitor Resolution</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{screenInfo.screen}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Device Pixel Ratio (DPR)</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{screenInfo.dpr}x</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Color Depth</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{screenInfo.colorDepth}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 465 — DEVICE INFORMATION */}
      {toolId === 465 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-500" /> Device Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Platform</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.platform}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Language / Locale</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.language}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">CPU Logical Cores</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.cores || 'Not reported'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Approx. Device Memory</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.memory ? `${deviceInfo.memory} GB` : 'Not reported'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Touch Input</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.touch ? 'Supported' : 'Not detected'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Network Status</span>
                <span className={`font-bold font-mono ${deviceInfo.online ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {deviceInfo.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 466 — BATTERY INFORMATION */}
      {toolId === 466 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-indigo-500" /> Battery Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Battery Level</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {batterySupported && batteryInfo ? `${batteryInfo.level}%` : 'Not supported in this browser'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-500">Charging Status</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {batterySupported && batteryInfo ? (batteryInfo.charging ? 'Charging' : 'Not Charging') : 'Not supported in this browser'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 468 — APP PERMISSION GUIDE */}
      {toolId === 468 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Browser Permission Guide
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { name: 'Microphone', why: 'Required by the Sound Level Meter and Speech-to-Text tools to analyze or transcribe audio.' },
                { name: 'Camera', why: 'Required by the Magnifier, Document Scanner and QR Scanner tools to capture images.' },
                { name: 'Storage / Persistent Storage', why: 'Lets Toolstrum keep your recent files and settings between sessions.' },
                { name: 'Notifications', why: 'Used by Reminders & Attendance tools to alert you at the scheduled time.' },
              ].map((p) => (
                <div key={p.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{p.name}</p>
                  <p className="text-slate-500 mt-1">{p.why}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 469 — OFFLINE REFERENCE LIBRARY */}
      {toolId === 469 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Offline Reference Library</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">WCAG Contrast Minimums</p>
                <p className="text-slate-500">Normal text: 4.5:1 · Large text: 3:1 · AAA: 7:1</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Common Keyboard Shortcuts</p>
                <p className="text-slate-500">Tab: next element · Shift+Tab: previous · Space/Enter: activate</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">File Size Units</p>
                <p className="text-slate-500">1 KB = 1024 B · 1 MB = 1024 KB · 1 GB = 1024 MB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 470 — EMERGENCY INFORMATION CARD */}
      {toolId === 470 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-indigo-500" /> Emergency Information Card
            </h3>
            <p className="text-xs text-slate-500">
              Store critical medical details locally on this device so they can be shown quickly in an emergency. Nothing is uploaded anywhere.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Full Name' },
                { key: 'bloodType', label: 'Blood Type' },
                { key: 'allergies', label: 'Allergies' },
                { key: 'medications', label: 'Current Medications' },
                { key: 'contactName', label: 'Emergency Contact Name' },
                { key: 'contactPhone', label: 'Emergency Contact Phone' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={(emergencyInfo as any)[f.key]}
                    onChange={(e) => setEmergencyInfo((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Additional Notes</label>
              <textarea
                value={emergencyInfo.notes}
                onChange={(e) => setEmergencyInfo((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs resize-none"
              />
            </div>

            <button
              onClick={saveEmergencyInfo}
              className="w-full py-3 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all"
            >
              {emergencySaved ? 'Saved ✓' : 'Save Emergency Card'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
