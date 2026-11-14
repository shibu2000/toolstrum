import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  BookOpen,
  Images,
  Download,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Type,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface VideoThumbnailStoryboardPanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type PanelMode = 'thumbnail' | 'storyboard' | 'frames';

export const VideoThumbnailStoryboardPanel: React.FC<VideoThumbnailStoryboardPanelProps> = ({
  initialToolId = 121,
  accentColor = '#A855F7',
}) => {
  const getInitialMode = (id: number): PanelMode => {
    if (id === 124) return 'storyboard';
    if (id === 112) return 'frames';
    return 'thumbnail';
  };

  const [mode, setMode] = useState<PanelMode>(() => getInitialMode(initialToolId));

  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoWidth, setVideoWidth] = useState(1920);
  const [videoHeight, setVideoHeight] = useState(1080);
  const [isPlaying, setIsPlaying] = useState(false);

  // Thumbnail Customization State (Tool 121)
  const [headlineText, setHeadlineText] = useState('AMAZING HIGHLIGHTS');
  const [badgeText, setBadgeText] = useState('4K ULTRA');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);
  const [aspectTarget, setAspectTarget] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

  // Storyboard PDF State (Tool 124)
  const [storyboardGrid, setStoryboardGrid] = useState<'3x3' | '2x2' | '4x4'>('3x3');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);

  // Frames Extraction State (Tool 112)
  const [frameCount, setFrameCount] = useState(8);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<{ time: number; dataUrl: string }[]>([]);

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Handle Video Select
  const handleVideoSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setVideoFile(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setThumbnailPreviewUrl(null);
    setExtractedFrames([]);
  };

  // Video metadata loaded
  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    setDuration(v.duration || 0);
    setVideoWidth(v.videoWidth || 1920);
    setVideoHeight(v.videoHeight || 1080);
    // Draw initial thumbnail
    setTimeout(captureCurrentThumbnail, 200);
  };

  // Video time update
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Toggle play/pause
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

  // Seek helper
  const seekToTime = (time: number): Promise<void> =>
    new Promise((resolve) => {
      const v = videoRef.current;
      if (!v) {
        resolve();
        return;
      }
      const onSeeked = () => {
        v.removeEventListener('seeked', onSeeked);
        resolve();
      };
      v.addEventListener('seeked', onSeeked);
      v.currentTime = time;
    });

  // 1. Capture & Render Custom Thumbnail (Tool 121)
  const captureCurrentThumbnail = useCallback(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;

    let targetW = 1280;
    let targetH = 720; // 16:9 default
    if (aspectTarget === '9:16') {
      targetW = 720;
      targetH = 1280;
    } else if (aspectTarget === '1:1') {
      targetW = 1080;
      targetH = 1080;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame cropped/fitted to target aspect
    const vAspect = (v.videoWidth || 16) / (v.videoHeight || 9);
    const tAspect = targetW / targetH;

    let drawW = targetW;
    let drawH = targetH;
    let offX = 0;
    let offY = 0;

    if (vAspect > tAspect) {
      drawW = targetH * vAspect;
      offX = (targetW - drawW) / 2;
    } else {
      drawH = targetW / vAspect;
      offY = (targetH - drawH) / 2;
    }

    ctx.drawImage(v, offX, offY, drawW, drawH);

    // Vignette gradient at bottom for text contrast
    const grad = ctx.createLinearGradient(0, targetH * 0.6, 0, targetH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, targetH * 0.5, targetW, targetH * 0.5);

    // Headline Text
    if (headlineText.trim()) {
      ctx.save();
      ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = textColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeText(headlineText.toUpperCase(), targetW / 2, targetH - 35);
      ctx.fillText(headlineText.toUpperCase(), targetW / 2, targetH - 35);
      ctx.restore();
    }

    // Badge pill at top right
    if (badgeText.trim()) {
      ctx.save();
      ctx.font = 'bold 22px system-ui, sans-serif';
      const textWidth = ctx.measureText(badgeText.toUpperCase()).width;
      const pillW = textWidth + 28;
      const pillH = 42;
      const pillX = targetW - pillW - 30;
      const pillY = 30;

      // Rounded rectangle badge
      ctx.fillStyle = '#A855F7';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), pillX + pillW / 2, pillY + pillH / 2);
      ctx.restore();
    }

    setThumbnailPreviewUrl(canvas.toDataURL('image/jpeg', 0.95));
  }, [aspectTarget, headlineText, badgeText, textColor, fontSize]);

  useEffect(() => {
    if (videoUrl && !isPlaying) {
      captureCurrentThumbnail();
    }
  }, [captureCurrentThumbnail, aspectTarget, headlineText, badgeText, textColor, fontSize]);

  // Download Thumbnail Image
  const downloadThumbnail = () => {
    if (!thumbnailPreviewUrl) return;
    const link = document.createElement('a');
    link.href = thumbnailPreviewUrl;
    const base = videoFile?.name ? videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) : 'video';
    link.download = `${base}-thumbnail-${aspectTarget.replace(':', 'x')}.jpg`;
    link.click();
  };

  // 2. Generate PDF Storyboard Contact Sheet (Tool 124)
  const generatePdfStoryboard = async () => {
    if (!videoRef.current || !duration) return;
    const v = videoRef.current;
    setIsGeneratingPdf(true);
    setPdfDownloadUrl(null);

    const wasPlaying = isPlaying;
    v.pause();

    try {
      const count = storyboardGrid === '2x2' ? 4 : storyboardGrid === '4x4' ? 16 : 9;
      const rows = storyboardGrid === '2x2' ? 2 : storyboardGrid === '4x4' ? 4 : 3;
      const cols = rows;

      const capturedShots: { time: string; dataUrl: string }[] = [];

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d')!;

      for (let i = 0; i < count; i++) {
        const time = (duration * i) / Math.max(1, count - 1);
        await seekToTime(Math.min(duration - 0.05, time));
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        const timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;

        capturedShots.push({
          time: timeStr,
          dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        });
      }

      // Compile into PDF via pdf-lib
      const pdfDoc = await PDFDocument.create();
      // Landscape A4: 841.89 x 595.28 pt
      const page = pdfDoc.addPage([841.89, 595.28]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Header Banner
      page.drawText('TOOLSTRUM • VIDEO STORYBOARD CONTACT SHEET', {
        x: 40,
        y: 560,
        size: 15,
        font: boldFont,
        color: rgb(0.66, 0.33, 0.97),
      });

      page.drawText(
        `Source: ${videoFile?.name || 'Video File'} • Duration: ${duration.toFixed(1)}s • ${count} Keyframes • 100% Offline`,
        {
          x: 40,
          y: 542,
          size: 9,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        }
      );

      // Grid dimensions
      const startX = 40;
      const startY = 515;
      const gridW = 841.89 - 80;
      const gridH = 475;
      const cellW = (gridW - (cols - 1) * 15) / cols;
      const cellH = (gridH - (rows - 1) * 20) / rows;

      for (let idx = 0; idx < capturedShots.length; idx++) {
        const shot = capturedShots[idx];
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        const cellX = startX + c * (cellW + 15);
        const cellY = startY - (r + 1) * cellH - r * 15;

        // Embed image
        const base64 = shot.dataUrl.split(',')[1];
        const imgBytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
        const embedded = await pdfDoc.embedJpg(imgBytes);

        page.drawImage(embedded, {
          x: cellX,
          y: cellY + 14,
          width: cellW,
          height: cellH - 14,
        });

        // Timecode badge
        page.drawText(`[${shot.time}] Shot #${idx + 1}`, {
          x: cellX,
          y: cellY + 2,
          size: 8,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfDownloadUrl(url);

      if (wasPlaying) v.play();
    } catch (e) {
      console.error('Storyboard PDF creation failed:', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 3. Extract N Frames to ZIP (Tool 112)
  const extractFramesToZip = async () => {
    if (!videoRef.current || !duration) return;
    const v = videoRef.current;
    setIsExtractingFrames(true);

    const wasPlaying = isPlaying;
    v.pause();

    try {
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth || 1920;
      canvas.height = videoHeight || 1080;
      const ctx = canvas.getContext('2d')!;

      const list: { time: number; dataUrl: string }[] = [];

      for (let i = 0; i < frameCount; i++) {
        const t = (duration * i) / Math.max(1, frameCount - 1);
        await seekToTime(Math.min(duration - 0.05, t));
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/png');
        list.push({ time: t, dataUrl });

        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/png'));
        zip.file(`frame_${String(i + 1).padStart(3, '0')}.png`, blob);
      }

      setExtractedFrames(list);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const base = videoFile?.name ? videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) : 'frames';
      link.download = `${base}-frames-${frameCount}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      if (wasPlaying) v.play();
    } catch (e) {
      console.error('Frame extraction failed:', e);
    } finally {
      setIsExtractingFrames(false);
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'thumbnail', label: 'Thumbnail Maker', icon: Camera },
            { id: 'storyboard', label: 'Video to PDF Storyboard', icon: BookOpen },
            { id: 'frames', label: 'Extract Frames (ZIP)', icon: Images },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as PanelMode)}
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
          <span>Local Canvas Rendering • 100% Offline</span>
        </div>
      </div>

      {/* Upload Zone */}
      {!videoUrl && (
        <div className="max-w-xl mx-auto py-12">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-3xl p-8 cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all group shadow-sm hover:shadow-md">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
              Select or Drop Video to Inspect & Capture
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Design custom thumbnails, compile printable PDF storyboards, or extract keyframes • 100% Offline
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleVideoSelect([e.target.files[0]]);
              }}
            />
          </label>
        </div>
      )}

      {videoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* THUMBNAIL MAKER CONTROLS (Tool 121) */}
            {mode === 'thumbnail' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-500" />
                  <span>Custom Thumbnail Design</span>
                </h4>

                {/* Aspect Ratio Presets */}
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Aspect Ratio Preset
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: '16:9', label: 'YouTube (16:9)' },
                      { id: '9:16', label: 'Reels/Shorts (9:16)' },
                      { id: '1:1', label: 'Square (1:1)' },
                    ].map((asp) => (
                      <button
                        key={asp.id}
                        onClick={() => setAspectTarget(asp.id as any)}
                        className={`py-2 rounded-xl border font-bold transition-all ${
                          aspectTarget === asp.id
                            ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        {asp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Headline Text</label>
                    <input
                      type="text"
                      value={headlineText}
                      onChange={(e) => setHeadlineText(e.target.value)}
                      placeholder="e.g. AMAZING NEW UPDATE"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase text-xs focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 block mb-1">Badge Callout (Top Right)</label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="e.g. 4K ULTRA"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold uppercase text-xs focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-600 dark:text-slate-400">Headline Font Size</span>
                      <span className="font-mono text-slate-900 dark:text-white">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={96}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadThumbnail}
                  disabled={!thumbnailPreviewUrl}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Thumbnail ({aspectTarget})</span>
                </button>
              </div>
            )}

            {/* STORYBOARD PDF CONTROLS (Tool 124) */}
            {mode === 'storyboard' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>Video Storyboard PDF Settings</span>
                </h4>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Contact Sheet Grid Format
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: '2x2', label: '2×2 (4 Shots)' },
                      { id: '3x3', label: '3×3 (9 Shots)' },
                      { id: '4x4', label: '4×4 (16 Shots)' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setStoryboardGrid(g.id as any)}
                        className={`py-2 rounded-xl border font-bold transition-all ${
                          storyboardGrid === g.id
                            ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evenly samples keyframes across the entire video timeline and compiles them into a printable landscape PDF with timestamp tags.
                </p>

                <button
                  onClick={generatePdfStoryboard}
                  disabled={isGeneratingPdf}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingPdf ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingPdf ? 'Extracting Frames & Building PDF...' : 'Generate PDF Storyboard'}</span>
                </button>

                {pdfDownloadUrl && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Storyboard PDF Ready</span>
                    </span>
                    <a
                      href={pdfDownloadUrl}
                      download={`storyboard_${Date.now()}.pdf`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* EXTRACT FRAMES CONTROLS (Tool 112) */}
            {mode === 'frames' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Images className="w-4 h-4 text-purple-500" />
                  <span>Video to Images (Frame Extraction)</span>
                </h4>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Total Frames to Extract</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {frameCount} PNG Images
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={24}
                    step={2}
                    value={frameCount}
                    onChange={(e) => setFrameCount(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Samples full-resolution stills evenly across the video and packages them into a clean ZIP archive.
                </p>

                <button
                  onClick={extractFramesToZip}
                  disabled={isExtractingFrames}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Download className={`w-4 h-4 ${isExtractingFrames ? 'animate-spin' : ''}`} />
                  <span>{isExtractingFrames ? 'Extracting Frames...' : `Extract & Download ZIP (${frameCount} Frames)`}</span>
                </button>
              </div>
            )}

            {/* Change Video File */}
            <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Select Different Video</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleVideoSelect([e.target.files[0]]);
                }}
              />
            </label>
          </div>

          {/* Interactive Player & Output Preview Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Native Video Scrubber */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {videoFile?.name}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatSec(currentTime)} / {formatSec(duration)} ({videoWidth} × {videoHeight})
                </span>
              </div>

              {/* Video Element */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={onTimeUpdate}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Scrubber Timeline Slider */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => {
                    const t = Number(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = t;
                    setCurrentTime(t);
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Thumbnail Canvas Preview (When mode is thumbnail) */}
            {mode === 'thumbnail' && thumbnailPreviewUrl && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 shadow-xs space-y-3">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                  <span>Generated Cover Artwork Preview</span>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                    Aspect {aspectTarget}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 border border-slate-800 max-h-[380px]">
                  <img
                    src={thumbnailPreviewUrl}
                    alt="Thumbnail preview"
                    className="max-h-[360px] w-auto object-contain rounded shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
