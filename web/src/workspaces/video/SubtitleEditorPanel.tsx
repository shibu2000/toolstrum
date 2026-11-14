import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Play,
  Pause,
  Plus,
  Trash2,
  Clock,
  Download,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  Search,
} from 'lucide-react';

export interface SubtitleEditorPanelProps {
  initialToolId?: number;
  accentColor?: string;
}

export interface SubtitleCue {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  text: string;
}

// Convert seconds to SRT timestamp: 00:01:23,450
const formatSrtTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
};

// Convert seconds to VTT timestamp: 00:01:23.450
const formatVttTime = (seconds: number): string => {
  return formatSrtTime(seconds).replace(',', '.');
};

// Parse SRT/VTT timestamp to seconds
const parseTimeString = (timeStr: string): number => {
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]) || 0;
    const m = parseFloat(parts[1]) || 0;
    const s = parseFloat(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const m = parseFloat(parts[0]) || 0;
    const s = parseFloat(parts[1]) || 0;
    return m * 60 + s;
  }
  return 0;
};

export const SubtitleEditorPanel: React.FC<SubtitleEditorPanelProps> = ({
  initialToolId = 116,
  accentColor = '#A855F7',
}) => {
  // Video File
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Subtitle Cues
  const [cues, setCues] = useState<SubtitleCue[]>([
    { id: 'cue-1', start: 1.0, end: 4.5, text: 'Welcome to Toolstrum Video Studio.' },
    { id: 'cue-2', start: 5.0, end: 8.5, text: 'All video processing is 100% on-device and private.' },
    { id: 'cue-3', start: 9.0, end: 13.0, text: 'Easily edit subtitles and export directly to SRT or WebVTT.' },
  ]);

  const [activeCueId, setActiveCueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle Video Select
  const handleVideoSelect = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setVideoFile(f);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(f));
  };

  // Import existing SRT or VTT
  const handleImportSubtitles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const parsed: SubtitleCue[] = [];
      const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);

      blocks.forEach((block, idx) => {
        const lines = block.trim().split('\n');
        if (lines.length < 2) return;

        // Find timecode line containing -->
        const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
        if (timeLineIdx !== -1) {
          const [startStr, endStr] = lines[timeLineIdx].split('-->');
          const startSec = parseTimeString(startStr);
          const endSec = parseTimeString(endStr);
          const text = lines.slice(timeLineIdx + 1).join('\n');

          if (text.trim()) {
            parsed.push({
              id: `cue-${idx + 1}-${Date.now()}`,
              start: startSec,
              end: endSec,
              text: text.trim(),
            });
          }
        }
      });

      if (parsed.length > 0) {
        setCues(parsed);
      }
    };
    reader.readAsText(f);
  };

  // Video Time Update & Cue Highlighting
  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    const active = cues.find((c) => t >= c.start && t <= c.end);
    setActiveCueId(active ? active.id : null);
  };

  // Toggle Video Playback
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

  // Jump Video to Cue Start Time
  const seekToCue = (start: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = start;
      setCurrentTime(start);
    }
  };

  // Add New Cue at Current Time
  const addCueAtCurrentTime = () => {
    const start = Math.round(currentTime * 10) / 10;
    const end = start + 3.0;
    const newCue: SubtitleCue = {
      id: `cue-${Date.now()}`,
      start,
      end,
      text: 'New subtitle cue text...',
    };
    const updated = [...cues, newCue].sort((a, b) => a.start - b.start);
    setCues(updated);
    setActiveCueId(newCue.id);
  };

  // Update Cue
  const updateCue = (id: string, field: 'start' | 'end' | 'text', val: any) => {
    setCues((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Delete Cue
  const deleteCue = (id: string) => {
    setCues((prev) => prev.filter((c) => c.id !== id));
  };

  // Shift all cues by delta seconds (e.g. +0.5s or -0.5s)
  const shiftAllCues = (delta: number) => {
    setCues((prev) =>
      prev.map((c) => ({
        ...c,
        start: Math.max(0, parseFloat((c.start + delta).toFixed(2))),
        end: Math.max(0.1, parseFloat((c.end + delta).toFixed(2))),
      }))
    );
  };

  // Export to SRT
  const exportSrt = () => {
    let srt = '';
    const sorted = [...cues].sort((a, b) => a.start - b.start);
    sorted.forEach((c, idx) => {
      srt += `${idx + 1}\n`;
      srt += `${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n`;
      srt += `${c.text}\n\n`;
    });

    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const base = videoFile?.name ? videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) : 'subtitles';
    link.download = `${base}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to WebVTT
  const exportVtt = () => {
    let vtt = 'WEBVTT\n\n';
    const sorted = [...cues].sort((a, b) => a.start - b.start);
    sorted.forEach((c, idx) => {
      vtt += `${idx + 1}\n`;
      vtt += `${formatVttTime(c.start)} --> ${formatVttTime(c.end)}\n`;
      vtt += `${c.text}\n\n`;
    });

    const blob = new Blob([vtt], { type: 'text/vtt;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const base = videoFile?.name ? videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) : 'subtitles';
    link.download = `${base}.vtt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered cues based on search
  const filteredCues = cues.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Load Video</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleVideoSelect(e.target.files)}
            />
          </label>

          <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-purple-500" />
            <span>Import .SRT / .VTT</span>
            <input
              type="file"
              accept=".srt,.vtt,.txt"
              className="hidden"
              onChange={handleImportSubtitles}
            />
          </label>

          <button
            onClick={addCueAtCurrentTime}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Cue at Playhead</span>
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={exportSrt}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .SRT</span>
          </button>

          <button
            onClick={exportVtt}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-500" />
            <span>Export .VTT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Synchronized Video Player */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                    className="w-full h-full object-contain"
                  />
                  {/* On-Screen Subtitle Display */}
                  {activeCueId && (
                    <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-center">
                      <span className="px-3 py-1.5 rounded-lg bg-black/75 text-white font-semibold text-xs backdrop-blur-xs">
                        {cues.find((c) => c.id === activeCueId)?.text}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Load a video above to preview subtitle synchronization in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* Playhead Controls */}
            {videoUrl && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
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

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Current: {formatSrtTime(currentTime)}</span>
                  <span>Total: {formatSrtTime(duration)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Timing Shift Helper */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
              Global Timecode Shift (Sync Audio/Video)
            </span>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[-1.0, -0.2, 0.2, 1.0].map((delta) => (
                <button
                  key={delta}
                  onClick={() => shiftAllCues(delta)}
                  className="py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold hover:border-purple-500"
                >
                  {delta > 0 ? `+${delta}s` : `${delta}s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Editable Subtitle Cue List */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subtitle text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Cue List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredCues.map((cue, idx) => {
              const isActive = activeCueId === cue.id;
              return (
                <div
                  key={cue.id}
                  onClick={() => seekToCue(cue.start)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-purple-500 bg-purple-500/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-[11px] text-purple-600 dark:text-purple-400">
                      Cue #{idx + 1}
                    </span>

                    {/* Time Inputs */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="number"
                        step={0.1}
                        value={cue.start}
                        onChange={(e) => updateCue(cue.id, 'start', parseFloat(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-right border-none focus:ring-1 focus:ring-purple-500"
                      />
                      <span className="text-slate-400">➜</span>
                      <input
                        type="number"
                        step={0.1}
                        value={cue.end}
                        onChange={(e) => updateCue(cue.id, 'end', parseFloat(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-right border-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => deleteCue(cue.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cue Textarea */}
                  <textarea
                    rows={2}
                    value={cue.text}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateCue(cue.id, 'text', e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
