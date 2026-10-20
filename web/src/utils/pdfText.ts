export interface ExtractedPage {
  pageNumber: number;
  text: string;
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

export async function extractPdfTextByPage(file: File | ArrayBuffer): Promise<ExtractedPage[]> {
  const pdfjsLib = await getPdfjs();
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const pages: ExtractedPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    pages.push({ pageNumber: i, text: text.trim() });
  }

  await doc.destroy();
  return pages;
}

export async function extractPdfText(file: File | ArrayBuffer): Promise<string> {
  const pages = await extractPdfTextByPage(file);
  return pages.map((p) => p.text).join('\n\n');
}
