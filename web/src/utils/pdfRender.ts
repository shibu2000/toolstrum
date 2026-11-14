export interface RenderedPage {
  pageNumber: number;
  url: string;
  blob: Blob;
}

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

export async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = (async () => {
      const [lib, workerSrc] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url').then((m) => m.default),
      ]);
      lib.GlobalWorkerOptions.workerSrc = workerSrc;
      return lib;
    })();
  }
  return pdfjsLibPromise;
}

/**
 * Loads a PDF.js document from a File or ArrayBuffer.
 */
export async function getPdfDocument(source: File | ArrayBuffer | Uint8Array) {
  const pdfjsLib = await getPdfjs();
  const data = source instanceof File ? await source.arrayBuffer() : source;
  return pdfjsLib.getDocument({ data }).promise;
}

/**
 * Renders a single PDF page into a compact JPEG data URL for fast thumbnail rendering.
 */
export async function renderPageThumbnail(
  doc: any,
  pageNumber: number,
  scale = 0.55
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');
  
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.82);
}

/**
 * Renders a single PDF page at high resolution for the Quick Preview modal.
 */
export async function renderPageHighRes(
  doc: any,
  pageNumber: number,
  scale = 1.5
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Parses user input like "1, 3-5, 8" into a Set of 1-based page numbers.
 */
export function parsePageSelection(input: string, totalPages: number): Set<number> {
  const selected = new Set<number>();
  if (!input || !totalPages) return selected;

  const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const tokens = part.split('-').map((s) => s.trim());
      if (tokens.length === 2) {
        const start = parseInt(tokens[0], 10);
        const end = parseInt(tokens[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(totalPages, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            selected.add(i);
          }
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        selected.add(p);
      }
    }
  }
  return selected;
}

/**
 * Converts a set/iterable of 1-based page numbers into a condensed range string, e.g. "1-3, 5, 7-9".
 */
export function formatPageSelection(pages: Iterable<number>): string {
  const sorted = Array.from(new Set(pages)).sort((a, b) => a - b);
  if (sorted.length === 0) return '';

  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      ranges.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`);
      rangeStart = cur;
      prev = cur;
    }
  }
  ranges.push(rangeStart === prev ? `${rangeStart}` : `${rangeStart}-${prev}`);
  return ranges.join(', ');
}

export async function renderPdfPagesToImages(
  file: File,
  format: 'png' | 'jpeg' = 'png',
  scale = 2
): Promise<RenderedPage[]> {
  const pdfjsLib = await getPdfjs();
  const data = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const pages: RenderedPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mime, 0.92));
    pages.push({ pageNumber: i, url: URL.createObjectURL(blob), blob });
  }

  await doc.destroy();
  return pages;
}
