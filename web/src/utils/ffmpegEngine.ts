import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
const CORE_BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<FFmpeg> | null = null;

export interface FFmpegLoadProgress {
  stage: 'downloading' | 'ready';
  message: string;
}

export async function loadFFmpegEngine(
  onProgress?: (progress: FFmpegLoadProgress) => void
): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg();
    onProgress?.({ stage: 'downloading', message: 'Downloading video engine (~25 MB, one-time)...' });

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    ]);

    await ffmpeg.load({ coreURL, wasmURL });

    onProgress?.({ stage: 'ready', message: 'Engine ready.' });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loadPromise;
}

export function isFFmpegLoaded(): boolean {
  return ffmpegInstance !== null;
}

export { fetchFile };

export async function runFFmpeg(
  ffmpeg: FFmpeg,
  inputs: { name: string; data: File | Blob }[],
  args: string[],
  outputName: string,
  onLog?: (message: string) => void
): Promise<Blob> {
  const logHandler = (event: { message: string }) => onLog?.(event.message);
  ffmpeg.on('log', logHandler);

  try {
    for (const input of inputs) {
      ffmpeg.writeFile(input.name, await fetchFile(input.data));
    }

    await ffmpeg.exec(['-y', ...args]);

    const data = await ffmpeg.readFile(outputName);
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data as string);
    return new Blob([bytes as BlobPart]);
  } finally {
    ffmpeg.off('log', logHandler);
    for (const input of inputs) {
      try {
        await ffmpeg.deleteFile(input.name);
      } catch {
        /* already removed */
      }
    }
    try {
      await ffmpeg.deleteFile(outputName);
    } catch {
      /* already removed */
    }
  }
}
