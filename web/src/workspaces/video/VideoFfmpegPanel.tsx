import React, { useState, useEffect } from 'react';
import { Wand2, Download, Loader2, X } from 'lucide-react';
import JSZip from 'jszip';
import { FileDropZone } from '../../components/common/FileDropZone';
import { loadFFmpegEngine, runFFmpeg, fetchFile } from '../../utils/ffmpegEngine';

type VideoOp =
  | 'trim'
  | 'compress'
  | 'format'
  | 'resize'
  | 'rotate'
  | 'crop'
  | 'speed'
  | 'mute'
  | 'gif'
  | 'mp3'
  | 'merge'
  | 'watermark'
  | 'fps'
  | 'subtitles'
  | 'replaceAudio'
  | 'transitions'
  | 'batch';

interface VideoFfmpegPanelProps {
  accentColor: string;
  defaultOp: VideoOp;
}

const OP_LABELS: Record<VideoOp, string> = {
  trim: 'Trim / Cut',
  compress: 'Compress',
  format: 'Convert Format',
  resize: 'Change Resolution',
  rotate: 'Rotate',
  crop: 'Crop',
  speed: 'Change Speed',
  mute: 'Remove Audio (Mute)',
  gif: 'Convert to GIF',
  mp3: 'Extract to MP3',
  merge: 'Merge Videos',
  watermark: 'Add Text Watermark',
  fps: 'Change Frame Rate',
  subtitles: 'Extract Subtitles',
  replaceAudio: 'Replace Audio Track',
  transitions: 'Merge with Transitions',
  batch: 'Batch Convert (ZIP)',
};

const makeWatermarkImage = (text: string): Promise<Blob> =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 48px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 4;
    ctx.textBaseline = 'middle';
    ctx.strokeText(text, 10, 60);
    ctx.fillText(text, 10, 60);
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });

export const VideoFfmpegPanel: React.FC<VideoFfmpegPanelProps> = ({ accentColor, defaultOp }) => {
  const [op, setOp] = useState<VideoOp>(defaultOp);
  const [file, setFile] = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [engineMessage, setEngineMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetFormat, setTargetFormat] = useState<'mp4' | 'webm' | 'mov' | 'avi'>('mp4');
  const [targetWidth, setTargetWidth] = useState(1280);
  const [rotateDeg, setRotateDeg] = useState<'90' | '180' | '270'>('90');
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(640);
  const [cropH, setCropH] = useState(480);
  const [speedFactor, setSpeedFactor] = useState(1.5);
  const [watermarkText, setWatermarkText] = useState('Toolstrum');
  const [targetFps, setTargetFps] = useState<'24' | '25' | '30' | '50' | '60'>('30');
  const [audioTrackFile, setAudioTrackFile] = useState<File | null>(null);
  const [transitionDuration, setTransitionDuration] = useState(1);

  useEffect(() => {
    setOp(defaultOp);
    setFile(null);
    setMergeFiles([]);
    setError('');
    setResultBlob(null);
    setResultName('');
  }, [defaultOp]);

  const isMulti = op === 'merge' || op === 'transitions' || op === 'batch';
  const baseName = (name: string) => name.replace(/\.[^/.]+$/, '');

  const getVideoDuration = (f: File): Promise<number> =>
    new Promise((resolve) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.src = URL.createObjectURL(f);
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(v.src);
        resolve(v.duration || 0);
      };
      v.onerror = () => resolve(0);
    });

  const run = async () => {
    setError('');
    setResultBlob(null);

    if (isMulti) {
      if (mergeFiles.length < 2) {
        setError('Add at least 2 video files.');
        return;
      }
    } else if (op === 'replaceAudio') {
      if (!file || !audioTrackFile) {
        setError('Please select both a video and a replacement audio file.');
        return;
      }
    } else if (!file) {
      setError('Please select a video file first.');
      return;
    }

    try {
      setIsLoadingEngine(true);
      const ffmpeg = await loadFFmpegEngine((p) => setEngineMessage(p.message));
      setIsLoadingEngine(false);
      setIsProcessing(true);
      setProgress(0);

      ffmpeg.on('progress', (e) => setProgress(Math.min(100, Math.round((e.progress || 0) * 100))));

      let args: string[] = [];
      let inputs: { name: string; data: File | Blob }[] = [];
      let outputName = 'output.mp4';
      let downloadExt = 'mp4';

      switch (op) {
        case 'trim': {
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-ss', String(trimStart), '-to', String(trimEnd), '-i', 'in.mp4', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', 'output.mp4'];
          break;
        }
        case 'compress': {
          const crf = quality === 'high' ? 20 : quality === 'medium' ? 28 : 34;
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-i', 'in.mp4', '-vcodec', 'libx264', '-crf', String(crf), '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '96k', 'output.mp4'];
          break;
        }
        case 'format': {
          inputs = [{ name: 'in.src', data: file! }];
          downloadExt = targetFormat;
          outputName = `output.${targetFormat}`;
          if (targetFormat === 'webm') {
            args = ['-i', 'in.src', '-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus', outputName];
          } else {
            args = ['-i', 'in.src', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', outputName];
          }
          break;
        }
        case 'resize': {
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-i', 'in.mp4', '-vf', `scale=${targetWidth}:-2`, '-c:a', 'copy', 'output.mp4'];
          break;
        }
        case 'rotate': {
          inputs = [{ name: 'in.mp4', data: file! }];
          const transpose = rotateDeg === '90' ? 'transpose=1' : rotateDeg === '270' ? 'transpose=2' : 'transpose=1,transpose=1';
          args = ['-i', 'in.mp4', '-vf', transpose, '-c:a', 'copy', 'output.mp4'];
          break;
        }
        case 'crop': {
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-i', 'in.mp4', '-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`, '-c:a', 'copy', 'output.mp4'];
          break;
        }
        case 'speed': {
          inputs = [{ name: 'in.mp4', data: file! }];
          const vFactor = (1 / speedFactor).toFixed(4);
          let aFilter = `atempo=${speedFactor}`;
          if (speedFactor > 2) aFilter = `atempo=2.0,atempo=${(speedFactor / 2).toFixed(4)}`;
          if (speedFactor < 0.5) aFilter = `atempo=0.5,atempo=${(speedFactor / 0.5).toFixed(4)}`;
          args = ['-i', 'in.mp4', '-vf', `setpts=${vFactor}*PTS`, '-filter:a', aFilter, 'output.mp4'];
          break;
        }
        case 'mute': {
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-i', 'in.mp4', '-c:v', 'copy', '-an', 'output.mp4'];
          break;
        }
        case 'gif': {
          inputs = [{ name: 'in.mp4', data: file! }];
          outputName = 'output.gif';
          downloadExt = 'gif';
          args = [
            '-i', 'in.mp4',
            '-vf', 'fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
            outputName,
          ];
          break;
        }
        case 'mp3': {
          inputs = [{ name: 'in.mp4', data: file! }];
          outputName = 'output.mp3';
          downloadExt = 'mp3';
          args = ['-i', 'in.mp4', '-vn', '-acodec', 'libmp3lame', '-b:a', '192k', outputName];
          break;
        }
        case 'merge': {
          inputs = mergeFiles.map((f, i) => ({ name: `in${i}.mp4`, data: f }));
          const filterParts = inputs.map((inp, i) => `[${i}:v][${i}:a]`).join('');
          args = [
            ...inputs.flatMap((inp) => ['-i', inp.name]),
            '-filter_complex', `${filterParts}concat=n=${inputs.length}:v=1:a=1[outv][outa]`,
            '-map', '[outv]', '-map', '[outa]',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac',
            'output.mp4',
          ];
          break;
        }
        case 'fps': {
          inputs = [{ name: 'in.mp4', data: file! }];
          args = ['-i', 'in.mp4', '-filter:v', `fps=${targetFps}`, '-c:a', 'copy', 'output.mp4'];
          break;
        }
        case 'watermark': {
          const wmBlob = await makeWatermarkImage(watermarkText);
          inputs = [{ name: 'in.mp4', data: file! }, { name: 'wm.png', data: wmBlob }];
          args = ['-i', 'in.mp4', '-i', 'wm.png', '-filter_complex', 'overlay=W-w-20:H-h-20', '-c:a', 'copy', 'output.mp4'];
          break;
        }
        case 'subtitles': {
          inputs = [{ name: 'in.mp4', data: file! }];
          outputName = 'output.srt';
          downloadExt = 'srt';
          args = ['-i', 'in.mp4', '-map', '0:s:0', outputName];
          break;
        }
        case 'replaceAudio': {
          inputs = [{ name: 'in.mp4', data: file! }, { name: 'newaudio.src', data: audioTrackFile! }];
          args = ['-i', 'in.mp4', '-i', 'newaudio.src', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-shortest', 'output.mp4'];
          break;
        }
        case 'transitions': {
          inputs = mergeFiles.map((f, i) => ({ name: `in${i}.mp4`, data: f }));
          const durations = await Promise.all(mergeFiles.map(getVideoDuration));
          let filter = '';
          let lastV = '0:v';
          let lastA = '0:a';
          let cumulative = durations[0];
          for (let i = 1; i < inputs.length; i++) {
            const offset = Math.max(0, cumulative - transitionDuration);
            const outV = i === inputs.length - 1 ? 'outv' : `v${i}`;
            const outA = i === inputs.length - 1 ? 'outa' : `a${i}`;
            filter += `[${lastV}][${i}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${offset.toFixed(2)}[${outV}];`;
            filter += `[${lastA}][${i}:a]acrossfade=d=${transitionDuration}[${outA}];`;
            lastV = outV;
            lastA = outA;
            cumulative += durations[i] - transitionDuration;
          }
          filter = filter.slice(0, -1);
          args = [
            ...inputs.flatMap((inp) => ['-i', inp.name]),
            '-filter_complex', filter,
            '-map', '[outv]', '-map', '[outa]',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac',
            'output.mp4',
          ];
          break;
        }
      }

      if (op === 'batch') {
        const zip = new JSZip();
        for (let i = 0; i < mergeFiles.length; i++) {
          const f = mergeFiles[i];
          const inName = `batch_in${i}.src`;
          const outName = `batch_out${i}.${targetFormat}`;
          ffmpeg.writeFile(inName, await fetchFile(f));
          const codecArgs = targetFormat === 'webm'
            ? ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus']
            : ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac'];
          await ffmpeg.exec(['-y', '-i', inName, ...codecArgs, outName]);
          const data = await ffmpeg.readFile(outName);
          const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
          zip.file(`${baseName(f.name)}.${targetFormat}`, bytes);
          await ffmpeg.deleteFile(inName);
          await ffmpeg.deleteFile(outName);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob(zipBlob);
        setResultName(`batch_converted_${targetFormat}.zip`);
      } else {
        const blob = await runFFmpeg(ffmpeg, inputs, args, outputName);
        setResultBlob(blob);
        const srcName = file ? baseName(file.name) : 'merged_video';
        setResultName(`${srcName}_${op}.${downloadExt}`);
      }
    } catch (e: any) {
      setError(`Processing failed: ${e.message || 'Unknown error while running the video engine.'}`);
    } finally {
      setIsLoadingEngine(false);
      setIsProcessing(false);
    }
  };

  const busy = isLoadingEngine || isProcessing;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{OP_LABELS[op]}</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">ffmpeg.wasm</span>
      </div>

      {isMulti ? (
        <div className="space-y-3">
          <FileDropZone
            accept="video/*"
            maxFiles={8}
            files={mergeFiles}
            onFilesChange={(files) => setMergeFiles((prev) => [...prev, ...files].slice(0, 8))}
            label="Add videos (in order)"
            sublabel="2-8 clips, same resolution recommended"
            accentColor={accentColor}
          />
          {mergeFiles.length > 0 && (
            <div className="space-y-1.5">
              {mergeFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                  <span className="truncate text-slate-700 dark:text-slate-300">{i + 1}. {f.name}</span>
                  <button onClick={() => setMergeFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <FileDropZone
            accept="video/*"
            maxFiles={1}
            files={file ? [file] : []}
            onFilesChange={(files) => {
              setFile(files[0] || null);
              setResultBlob(null);
            }}
            label="Select video to process"
            sublabel="MP4, WebM, MOV, AVI"
            accentColor={accentColor}
          />
          {op === 'replaceAudio' && (
            <FileDropZone
              accept="audio/*"
              maxFiles={1}
              files={audioTrackFile ? [audioTrackFile] : []}
              onFilesChange={(files) => setAudioTrackFile(files[0] || null)}
              label="Select replacement audio track"
              sublabel="MP3, WAV, M4A"
              accentColor={accentColor}
            />
          )}
        </>
      )}

      {/* Operation-specific controls */}
      {op === 'trim' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Start (seconds)</label>
            <input type="number" min={0} value={trimStart} onChange={(e) => setTrimStart(Math.max(0, Number(e.target.value)))} className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">End (seconds)</label>
            <input type="number" min={0} value={trimEnd} onChange={(e) => setTrimEnd(Math.max(0, Number(e.target.value)))} className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
        </div>
      )}

      {op === 'compress' && (
        <div className="flex gap-2">
          {(['high', 'medium', 'low'] as const).map((q) => (
            <button key={q} onClick={() => setQuality(q)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${quality === q ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {q} quality
            </button>
          ))}
        </div>
      )}

      {(op === 'format' || op === 'batch') && (
        <div className="flex gap-2 flex-wrap">
          {(['mp4', 'webm', 'mov', 'avi'] as const).map((f) => (
            <button key={f} onClick={() => setTargetFormat(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase ${targetFormat === f ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      )}

      {op === 'resize' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Target Width (height auto-scaled): {targetWidth}px</label>
          <input type="range" min={240} max={1920} step={40} value={targetWidth} onChange={(e) => setTargetWidth(Number(e.target.value))} className="w-full accent-purple-600" />
        </div>
      )}

      {op === 'rotate' && (
        <div className="flex gap-2">
          {(['90', '180', '270'] as const).map((d) => (
            <button key={d} onClick={() => setRotateDeg(d)} className={`flex-1 py-2 rounded-xl text-xs font-semibold ${rotateDeg === d ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {d}°
            </button>
          ))}
        </div>
      )}

      {op === 'crop' && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'X', val: cropX, set: setCropX },
            { label: 'Y', val: cropY, set: setCropY },
            { label: 'Width', val: cropW, set: setCropW },
            { label: 'Height', val: cropH, set: setCropH },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] text-slate-500 block mb-1">{f.label}</label>
              <input type="number" min={0} value={f.val} onChange={(e) => f.set(Math.max(0, Number(e.target.value)))} className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
          ))}
        </div>
      )}

      {op === 'speed' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Speed Factor: {speedFactor}x</label>
          <input type="range" min={0.25} max={3} step={0.25} value={speedFactor} onChange={(e) => setSpeedFactor(Number(e.target.value))} className="w-full accent-purple-600" />
        </div>
      )}

      {op === 'fps' && (
        <div className="flex gap-2 flex-wrap">
          {(['24', '25', '30', '50', '60'] as const).map((f) => (
            <button key={f} onClick={() => setTargetFps(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold ${targetFps === f ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {f} fps
            </button>
          ))}
        </div>
      )}

      {op === 'transitions' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Fade Transition Duration: {transitionDuration}s</label>
          <input type="range" min={0.5} max={3} step={0.5} value={transitionDuration} onChange={(e) => setTransitionDuration(Number(e.target.value))} className="w-full accent-purple-600" />
        </div>
      )}

      {op === 'subtitles' && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Extracts the first embedded subtitle track as an .srt file. If your video has no embedded subtitles (most web-sourced MP4s don't), this will report an error rather than fabricate a transcript.
        </p>
      )}

      {op === 'watermark' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Watermark Text</label>
          <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={run}
        disabled={busy}
        className="w-full py-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
        style={{ backgroundColor: accentColor }}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {isLoadingEngine ? engineMessage : isProcessing ? `Processing... ${progress}%` : `Run ${OP_LABELS[op]}`}
      </button>

      {resultBlob && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Done ({(resultBlob.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
            <a
              href={URL.createObjectURL(resultBlob)}
              download={resultName}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          </div>
          {resultName.match(/\.(mp4|webm|mov|avi)$/) && (
            <video controls src={URL.createObjectURL(resultBlob)} className="w-full rounded-lg max-h-64" />
          )}
          {resultName.endsWith('.gif') && (
            <img src={URL.createObjectURL(resultBlob)} alt="Result GIF" className="w-full rounded-lg max-h-64 object-contain" />
          )}
          {resultName.endsWith('.mp3') && (
            <audio controls src={URL.createObjectURL(resultBlob)} className="w-full h-8" />
          )}
        </div>
      )}
    </div>
  );
};
