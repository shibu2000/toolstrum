export interface RenderedPage {
  pageNumber: number;
  url: string;
  blob: Blob;
}

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist')> | null = null;

async function getPdfjs() {
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
