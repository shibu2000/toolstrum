import React, { useState, useEffect } from 'react';
import { Wand2, Download, Loader2, X } from 'lucide-react';
import JSZip from 'jszip';
import { FileDropZone } from '../../components/common/FileDropZone';
import { loadFFmpegEngine, runFFmpeg, fetchFile } from '../../utils/ffmpegEngine';

type AudioOp =
  | 'compress'
  | 'convert'
  | 'trim'
  | 'merge'
  | 'crossfade'
  | 'split'
  | 'speed'
  | 'pitch'
  | 'volume'
  | 'normalize'
  | 'denoise'
  | 'silence'
  | 'channels'
  | 'extract'
  | 'metadata'
  | 'batch';

interface AudioFfmpegPanelProps {
  accentColor: string;
  defaultOp: AudioOp;
}

const OP_LABELS: Record<AudioOp, string> = {
  compress: 'Compress',
  convert: 'Convert Format',
  trim: 'Trim / Cut',
  merge: 'Merge / Join',
  crossfade: 'Join with Crossfade',
  split: 'Split into Parts',
  speed: 'Change Speed',
  pitch: 'Change Pitch',
  volume: 'Boost Volume',
  normalize: 'Normalize Loudness',
  denoise: 'Reduce Noise',
  silence: 'Remove Silence',
  channels: 'Mono / Stereo',
  extract: 'Extract Audio from Video',
  metadata: 'Edit Tags & Cover Art',
  batch: 'Batch Convert (ZIP)',
};

export const AudioFfmpegPanel: React.FC<AudioFfmpegPanelProps> = ({ accentColor, defaultOp }) => {
  const [op, setOp] = useState<AudioOp>(defaultOp);
  const [file, setFile] = useState<File | null>(null);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const [isLoadingEngine, setIsLoadingEngine] = useState(false);
  const [engineMessage, setEngineMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resultBlobs, setResultBlobs] = useState<{ blob: Blob; name: string }[]>([]);

  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'ogg' | 'aac' | 'flac'>('mp3');
  const [speedFactor, setSpeedFactor] = useState(1.5);
  const [pitchSemitones, setPitchSemitones] = useState(0);
  const [volumeGainDb, setVolumeGainDb] = useState(6);
  const [channelMode, setChannelMode] = useState<'mono' | 'stereo'>('mono');
  const [splitParts, setSplitParts] = useState(2);
  const [crossfadeDuration, setCrossfadeDuration] = useState(2);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaArtist, setMetaArtist] = useState('');
  const [metaAlbum, setMetaAlbum] = useState('');
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

  useEffect(() => {
    setOp(defaultOp);
    setFile(null);
    setMultiFiles([]);
    setError('');
    setResultBlobs([]);
  }, [defaultOp]);

  const isMulti = op === 'merge' || op === 'crossfade' || op === 'batch';
  const accept = op === 'extract' ? 'video/*' : 'audio/*';

  const baseName = (name: string) => name.replace(/\.[^/.]+$/, '');

  const run = async () => {
    setError('');
    setResultBlobs([]);

    if (isMulti) {
      if (multiFiles.length < 2) {
        setError('Add at least 2 audio files.');
        return;
      }
    } else if (!file) {
      setError('Please select a file first.');
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
      let outputs: { outputName: string; downloadName: string }[] = [];

      const crf = quality === 'high' ? '320k' : quality === 'medium' ? '192k' : '96k';

      switch (op) {
        case 'compress': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_compressed.mp3` }];
          args = ['-i', 'in.src', '-acodec', 'libmp3lame', '-b:a', crf, 'output.mp3'];
          break;
        }
        case 'convert': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: `output.${targetFormat}`, downloadName: `${baseName(file!.name)}.${targetFormat}` }];
          const codecMap: Record<string, string[]> = {
            mp3: ['-acodec', 'libmp3lame', '-b:a', '192k'],
            wav: ['-acodec', 'pcm_s16le'],
            ogg: ['-acodec', 'libvorbis', '-q:a', '5'],
            aac: ['-acodec', 'aac', '-b:a', '192k'],
            flac: ['-acodec', 'flac'],
          };
          args = ['-i', 'in.src', ...codecMap[targetFormat], `output.${targetFormat}`];
          break;
        }
        case 'extract': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: `output.${targetFormat}`, downloadName: `${baseName(file!.name)}_audio.${targetFormat}` }];
          const extractCodec: Record<string, string[]> = {
            mp3: ['-acodec', 'libmp3lame', '-b:a', '192k'],
            wav: ['-acodec', 'pcm_s16le'],
            ogg: ['-acodec', 'libvorbis', '-q:a', '5'],
            aac: ['-acodec', 'aac', '-b:a', '192k'],
            flac: ['-acodec', 'flac'],
          };
          args = ['-i', 'in.src', '-vn', ...extractCodec[targetFormat], `output.${targetFormat}`];
          break;
        }
        case 'trim': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_trimmed.mp3` }];
          args = ['-ss', String(trimStart), '-to', String(trimEnd), '-i', 'in.src', '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'merge': {
          inputs = multiFiles.map((f, i) => ({ name: `in${i}.src`, data: f }));
          outputs = [{ outputName: 'output.mp3', downloadName: 'merged_audio.mp3' }];
          const filterParts = inputs.map((_, i) => `[${i}:a]`).join('');
          args = [
            ...inputs.flatMap((inp) => ['-i', inp.name]),
            '-filter_complex', `${filterParts}concat=n=${inputs.length}:v=0:a=1[outa]`,
            '-map', '[outa]', '-acodec', 'libmp3lame', '-b:a', '192k',
            'output.mp3',
          ];
          break;
        }
        case 'crossfade': {
          inputs = multiFiles.map((f, i) => ({ name: `in${i}.src`, data: f }));
          outputs = [{ outputName: 'output.mp3', downloadName: 'crossfaded_audio.mp3' }];
          let filter = '';
          let lastLabel = '0:a';
          for (let i = 1; i < inputs.length; i++) {
            const outLabel = i === inputs.length - 1 ? 'outa' : `cf${i}`;
            filter += `[${lastLabel}][${i}:a]acrossfade=d=${crossfadeDuration}:c1=tri:c2=tri[${outLabel}];`;
            lastLabel = outLabel;
          }
          filter = filter.slice(0, -1);
          args = [
            ...inputs.flatMap((inp) => ['-i', inp.name]),
            '-filter_complex', filter,
            '-map', '[outa]', '-acodec', 'libmp3lame', '-b:a', '192k',
            'output.mp3',
          ];
          break;
        }
        case 'split': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = Array.from({ length: splitParts }, (_, i) => ({
            outputName: `part${i}.mp3`,
            downloadName: `${baseName(file!.name)}_part${i + 1}.mp3`,
          }));
          args = ['-i', 'in.src', '-f', 'segment', '-segment_time', '__SEG__', '-acodec', 'libmp3lame', '-b:a', '192k', 'part%d.mp3'];
          break;
        }
        case 'speed': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_${speedFactor}x.mp3` }];
          let aFilter = `atempo=${speedFactor}`;
          if (speedFactor > 2) aFilter = `atempo=2.0,atempo=${(speedFactor / 2).toFixed(4)}`;
          if (speedFactor < 0.5) aFilter = `atempo=0.5,atempo=${(speedFactor / 0.5).toFixed(4)}`;
          args = ['-i', 'in.src', '-filter:a', aFilter, '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'pitch': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_pitched.mp3` }];
          const rate = Math.pow(2, pitchSemitones / 12);
          args = ['-i', 'in.src', '-filter:a', `asetrate=44100*${rate},aresample=44100`, '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'volume': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_boosted.mp3` }];
          args = ['-i', 'in.src', '-filter:a', `volume=${volumeGainDb}dB`, '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'normalize': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_normalized.mp3` }];
          args = ['-i', 'in.src', '-filter:a', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'denoise': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_denoised.mp3` }];
          args = ['-i', 'in.src', '-filter:a', 'afftdn=nf=-25', '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'silence': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_no_silence.mp3` }];
          args = ['-i', 'in.src', '-af', 'silenceremove=start_periods=1:start_threshold=-40dB:stop_periods=-1:stop_threshold=-40dB', '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'channels': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_${channelMode}.mp3` }];
          args = ['-i', 'in.src', '-ac', channelMode === 'mono' ? '1' : '2', '-acodec', 'libmp3lame', '-b:a', '192k', 'output.mp3'];
          break;
        }
        case 'metadata': {
          inputs = [{ name: 'in.src', data: file! }];
          outputs = [{ outputName: 'output.mp3', downloadName: `${baseName(file!.name)}_tagged.mp3` }];
          const metaArgs: string[] = [];
          if (metaTitle) metaArgs.push('-metadata', `title=${metaTitle}`);
          if (metaArtist) metaArgs.push('-metadata', `artist=${metaArtist}`);
          if (metaAlbum) metaArgs.push('-metadata', `album=${metaAlbum}`);
          if (coverArtFile) {
            inputs.push({ name: 'cover.jpg', data: coverArtFile });
            args = [
              '-i', 'in.src', '-i', 'cover.jpg',
              '-map', '0:a', '-map', '1:0',
              '-c:a', 'libmp3lame', '-b:a', '192k', '-c:v', 'copy',
              '-id3v2_version', '3', '-metadata:s:v', 'title=Album cover', '-metadata:s:v', 'comment=Cover (front)',
              ...metaArgs,
              'output.mp3',
            ];
          } else {
            args = ['-i', 'in.src', '-acodec', 'libmp3lame', '-b:a', '192k', ...metaArgs, 'output.mp3'];
          }
          break;
        }
      }

      if (op === 'batch') {
        const zip = new JSZip();
        const codecMap: Record<string, string[]> = {
          mp3: ['-acodec', 'libmp3lame', '-b:a', '192k'],
          wav: ['-acodec', 'pcm_s16le'],
          ogg: ['-acodec', 'libvorbis', '-q:a', '5'],
          aac: ['-acodec', 'aac', '-b:a', '192k'],
          flac: ['-acodec', 'flac'],
        };
        for (let i = 0; i < multiFiles.length; i++) {
          const f = multiFiles[i];
          const inName = `batch_in${i}.src`;
          const outName = `batch_out${i}.${targetFormat}`;
          ffmpeg.writeFile(inName, await fetchFile(f));
          await ffmpeg.exec(['-y', '-i', inName, ...codecMap[targetFormat], outName]);
          const data = await ffmpeg.readFile(outName);
          const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
          zip.file(`${baseName(f.name)}.${targetFormat}`, bytes);
          await ffmpeg.deleteFile(inName);
          await ffmpeg.deleteFile(outName);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlobs([{ blob: zipBlob, name: `batch_converted_${targetFormat}.zip` }]);
      } else if (op === 'split') {
        // Rough equal split: estimate duration via HTMLAudioElement first.
        const durationSec = await new Promise<number>((resolve) => {
          const a = new Audio(URL.createObjectURL(file!));
          a.addEventListener('loadedmetadata', () => resolve(a.duration || 0));
          a.addEventListener('error', () => resolve(0));
        });
        const segLen = Math.max(1, Math.ceil(durationSec / splitParts));
        const finalArgs = args.map((a) => (a === '__SEG__' ? String(segLen) : a));
        for (const input of inputs) ffmpeg.writeFile(input.name, await fetchFile(input.data));
        await ffmpeg.exec(['-y', ...finalArgs]);
        const produced: { blob: Blob; name: string }[] = [];
        for (let i = 0; i < splitParts; i++) {
          try {
            const data = await ffmpeg.readFile(`part${i}.mp3`);
            const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
            produced.push({ blob: new Blob([bytes as BlobPart]), name: `${baseName(file!.name)}_part${i + 1}.mp3` });
            await ffmpeg.deleteFile(`part${i}.mp3`);
          } catch {
            /* fewer parts produced than requested */
          }
        }
        for (const input of inputs) {
          try { await ffmpeg.deleteFile(input.name); } catch { /* noop */ }
        }
        setResultBlobs(produced);
      } else {
        const blob = await runFFmpeg(ffmpeg, inputs, args, outputs[0].outputName);
        setResultBlobs([{ blob, name: outputs[0].downloadName }]);
      }
    } catch (e: any) {
      setError(`Processing failed: ${e.message || 'Unknown error while running the audio engine.'}`);
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
          <Wand2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{OP_LABELS[op]}</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">ffmpeg.wasm</span>
      </div>

      {isMulti ? (
        <div className="space-y-3">
          <FileDropZone
            accept="audio/*"
            maxFiles={8}
            files={multiFiles}
            onFilesChange={(files) => setMultiFiles((prev) => [...prev, ...files].slice(0, 8))}
            label="Add audio files (in order)"
            sublabel="2-8 clips"
            accentColor={accentColor}
          />
          {multiFiles.length > 0 && (
            <div className="space-y-1.5">
              {multiFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                  <span className="truncate text-slate-700 dark:text-slate-300">{i + 1}. {f.name}</span>
                  <button onClick={() => setMultiFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <FileDropZone
          accept={accept}
          maxFiles={1}
          files={file ? [file] : []}
          onFilesChange={(files) => {
            setFile(files[0] || null);
            setResultBlobs([]);
          }}
          label={op === 'extract' ? 'Select video to extract audio from' : 'Select audio file'}
          sublabel={op === 'extract' ? 'MP4, WebM, MOV' : 'MP3, WAV, M4A, OGG, FLAC'}
          accentColor={accentColor}
        />
      )}

      {op === 'trim' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Start (s)</label>
            <input type="number" min={0} value={trimStart} onChange={(e) => setTrimStart(Math.max(0, Number(e.target.value)))} className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">End (s)</label>
            <input type="number" min={0} value={trimEnd} onChange={(e) => setTrimEnd(Math.max(0, Number(e.target.value)))} className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
        </div>
      )}

      {op === 'compress' && (
        <div className="flex gap-2">
          {(['high', 'medium', 'low'] as const).map((q) => (
            <button key={q} onClick={() => setQuality(q)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${quality === q ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {q}
            </button>
          ))}
        </div>
      )}

      {(op === 'convert' || op === 'extract' || op === 'batch') && (
        <div className="flex gap-2 flex-wrap">
          {(['mp3', 'wav', 'ogg', 'aac', 'flac'] as const).map((f) => (
            <button key={f} onClick={() => setTargetFormat(f)} className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase ${targetFormat === f ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      )}

      {op === 'split' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Number of Parts: {splitParts}</label>
          <input type="range" min={2} max={8} value={splitParts} onChange={(e) => setSplitParts(Number(e.target.value))} className="w-full accent-violet-600" />
        </div>
      )}

      {op === 'crossfade' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Crossfade Duration: {crossfadeDuration}s</label>
          <input type="range" min={0.5} max={5} step={0.5} value={crossfadeDuration} onChange={(e) => setCrossfadeDuration(Number(e.target.value))} className="w-full accent-violet-600" />
        </div>
      )}

      {op === 'speed' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Speed Factor: {speedFactor}x</label>
          <input type="range" min={0.25} max={3} step={0.25} value={speedFactor} onChange={(e) => setSpeedFactor(Number(e.target.value))} className="w-full accent-violet-600" />
        </div>
      )}

      {op === 'pitch' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Pitch Shift: {pitchSemitones > 0 ? '+' : ''}{pitchSemitones} semitones</label>
          <input type="range" min={-12} max={12} value={pitchSemitones} onChange={(e) => setPitchSemitones(Number(e.target.value))} className="w-full accent-violet-600" />
        </div>
      )}

      {op === 'volume' && (
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Gain: +{volumeGainDb} dB</label>
          <input type="range" min={1} max={20} value={volumeGainDb} onChange={(e) => setVolumeGainDb(Number(e.target.value))} className="w-full accent-violet-600" />
        </div>
      )}

      {op === 'channels' && (
        <div className="flex gap-2">
          {(['mono', 'stereo'] as const).map((c) => (
            <button key={c} onClick={() => setChannelMode(c)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${channelMode === c ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {op === 'metadata' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" placeholder="Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            <input type="text" placeholder="Artist" value={metaArtist} onChange={(e) => setMetaArtist(e.target.value)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            <input type="text" placeholder="Album" value={metaAlbum} onChange={(e) => setMetaAlbum(e.target.value)} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>
          <FileDropZone
            accept="image/*"
            maxFiles={1}
            files={coverArtFile ? [coverArtFile] : []}
            onFilesChange={(files) => setCoverArtFile(files[0] || null)}
            label="Add cover art (optional)"
            sublabel="JPG or PNG"
            accentColor={accentColor}
          />
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

      {resultBlobs.length > 0 && (
        <div className="space-y-2">
          {resultBlobs.map((r, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {r.name} ({(r.blob.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <a
                  href={URL.createObjectURL(r.blob)}
                  download={r.name}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 ml-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
              {!r.name.endsWith('.zip') && <audio controls src={URL.createObjectURL(r.blob)} className="w-full h-8" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
