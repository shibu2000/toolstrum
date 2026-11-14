import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  FileText,
  Download,
  Trash2,
  ShieldCheck,
  FileArchive,
  Sparkles,
  Eye,
  Sliders,
  Check,
  CheckSquare,
  Square,
  ZoomIn,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';
import {
  getPdfDocument,
  renderPageThumbnail,
  renderPageHighRes,
  parsePageSelection,
  formatPageSelection,
} from '../../utils/pdfRender';

export interface PdfPageItem {
  pageNumber: number;
  thumbnailUrl: string;
  selected: boolean;
  blob?: Blob;
  downloadUrl?: string;
  status: 'pending' | 'rendering' | 'done' | 'error';
}

export type RenderDpiOption = '150' | '300' | '72';
export type RenderFormatOption = 'png' | 'jpeg' | 'webp';

interface PdfToImagePanelProps {
  accentColor?: string;
}

export const PdfToImagePanel: React.FC<PdfToImagePanelProps> = ({
  accentColor = '#10B981',
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');

  // Settings
  const [format, setFormat] = useState<RenderFormatOption>('png');
  const [dpi, setDpi] = useState<RenderDpiOption>('300'); // 300 DPI high-res default
  const [quality, setQuality] = useState<number>(92);

  // Processing state
  const [isRenderingThumbnails, setIsRenderingThumbnails] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [hasExported, setHasExported] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // Modal preview
  const [modalPageNumber, setModalPageNumber] = useState<number | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Load PDF and generate quick thumbnail preview grid
  const handlePdfLoaded = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setPdfFile(file);
    setIsRenderingThumbnails(true);
    setHasExported(false);
    setZipBlob(null);
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setZipUrl(null);

    try {
      const doc = await getPdfDocument(file);
      const count = doc.numPages;
      setTotalPages(count);

      const items: PdfPageItem[] = [];
      for (let i = 1; i <= count; i++) {
        const thumb = await renderPageThumbnail(doc, i, 0.45);
        items.push({
          pageNumber: i,
          thumbnailUrl: thumb,
          selected: true,
          status: 'pending',
        });
      }

      setPages(items);
      setRangeInput(`1-${count}`);
    } catch (err: any) {
      alert(`Could not read PDF: ${err.message || 'Corrupt or unsupported format.'}`);
      setPdfFile(null);
    } finally {
      setIsRenderingThumbnails(false);
    }
  };

  // Sync selection from range input
  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    const selectedSet = parsePageSelection(val, totalPages);
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        selected: selectedSet.has(p.pageNumber),
      }))
    );
  };

  // Toggle individual page selection
  const togglePageSelection = (pageNum: number) => {
    setPages((prev) => {
      const next = prev.map((p) =>
        p.pageNumber === pageNum ? { ...p, selected: !p.selected } : p
      );
      const selectedNums = next.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(formatPageSelection(selectedNums));
      return next;
    });
  };

  // Selection presets
  const handleSelectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    setRangeInput(totalPages > 1 ? `1-${totalPages}` : '1');
  };

  const handleSelectNone = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setRangeInput('');
  };

  const handleSelectOdd = () => {
    setPages((prev) => {
      const next = prev.map((p) => ({ ...p, selected: p.pageNumber % 2 !== 0 }));
      const selectedNums = next.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(formatPageSelection(selectedNums));
      return next;
    });
  };

  const handleSelectEven = () => {
    setPages((prev) => {
      const next = prev.map((p) => ({ ...p, selected: p.pageNumber % 2 === 0 }));
      const selectedNums = next.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(formatPageSelection(selectedNums));
      return next;
    });
  };

  // High-Res Modal Quick Preview
  const openModalPreview = async (pageNum: number) => {
    if (!pdfFile) return;
    setModalPageNumber(pageNum);
    setIsModalLoading(true);
    try {
      const doc = await getPdfDocument(pdfFile);
      const highRes = await renderPageHighRes(doc, pageNum, 1.8);
      setModalImageUrl(highRes);
    } catch {
      setModalImageUrl(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalPageNumber(null);
    setModalImageUrl(null);
  };

  // Render high-res images for selected pages and package as ZIP
  const handleExportSelected = async () => {
    if (!pdfFile || pages.length === 0) return;
    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      alert('Please select at least 1 page to convert.');
      return;
    }

    setIsExporting(true);
    setExportProgress({ current: 0, total: selectedPages.length });

    try {
      const doc = await getPdfDocument(pdfFile);
      const zip = new JSZip();
      const scale = dpi === '300' ? 2.5 : dpi === '150' ? 1.5 : 1.0;
      const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
      const ext = format === 'jpeg' ? 'jpg' : format;

      const updatedPages = [...pages];

      for (let i = 0; i < selectedPages.length; i++) {
        const item = selectedPages[i];
        setExportProgress({ current: i + 1, total: selectedPages.length });

        const page = await doc.getPage(item.pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d')!;

        // White background for JPEG
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob: Blob = await new Promise((resolve) =>
          canvas.toBlob((b) => resolve(b!), mime, quality / 100)
        );

        const fileName = `${pdfFile.name.replace(/\.[^/.]+$/, '')}_page_${item.pageNumber}.${ext}`;
        zip.file(fileName, blob);

        const pageIndex = updatedPages.findIndex((p) => p.pageNumber === item.pageNumber);
        if (pageIndex !== -1) {
          if (updatedPages[pageIndex].downloadUrl) {
            URL.revokeObjectURL(updatedPages[pageIndex].downloadUrl!);
          }
          updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            blob,
            downloadUrl: URL.createObjectURL(blob),
            status: 'done',
          };
        }
      }

      setPages(updatedPages);

      const generatedZip = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(generatedZip);

      if (zipUrl) URL.revokeObjectURL(zipUrl);
      setZipBlob(generatedZip);
      setZipUrl(url);
      setHasExported(true);

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const handleDownloadZip = () => {
    if (!zipUrl || !pdfFile) return;
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = `${pdfFile.name.replace(/\.[^/.]+$/, '')}_images_${format.toUpperCase()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClearPdf = () => {
    pages.forEach((p) => {
      if (p.downloadUrl) URL.revokeObjectURL(p.downloadUrl);
    });
    if (zipUrl) URL.revokeObjectURL(zipUrl);
    setPdfFile(null);
    setPages([]);
    setTotalPages(0);
    setRangeInput('');
    setHasExported(false);
    setZipBlob(null);
    setZipUrl(null);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {!pdfFile && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="application/pdf"
            multiple={false}
            label="Select or drop a PDF document"
            sublabel="Extract every page to high-res PNG, JPG, or WebP images • 100% Offline with PDF.js"
            files={[]}
            onFilesChange={handlePdfLoaded}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace when PDF is loaded */}
      {pdfFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Interactive Page Selection Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>Select Pages to Convert</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {pdfFile.name} &bull; {selectedCount} of {totalPages} pages selected
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearPdf}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Remove PDF"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Selection Range & Quick Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                  <span className="text-slate-500 text-xs shrink-0 font-medium">Pages:</span>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="e.g. 1-3, 5"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectOdd}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Odd
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectEven}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Even
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectNone}
                    className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Page Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1 scrollbar-thin">
                {pages.map((p) => (
                  <div
                    key={p.pageNumber}
                    onClick={() => togglePageSelection(p.pageNumber)}
                    className={`relative group rounded-xl border p-2 flex flex-col justify-between shadow-2xs transition-all cursor-pointer ${
                      p.selected
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/50'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox and Page Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center text-white ${
                          p.selected ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      >
                        {p.selected ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-black/75 text-white font-mono text-[9px] font-bold">
                        P{p.pageNumber}
                      </span>
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModalPreview(p.pageNumber);
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-1 rounded-md bg-black/60 text-white hover:bg-black/90 transition-colors"
                      title="Quick Preview"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>

                    {/* Thumbnail Viewport */}
                    <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-white shadow-xs flex items-center justify-center my-1">
                      <img
                        src={p.thumbnailUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Bottom Status / Individual Download */}
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                      <span>{p.selected ? 'Selected' : 'Skipped'}</span>
                      {p.downloadUrl && (
                        <a
                          href={p.downloadUrl}
                          download={`${pdfFile.name.replace(/\.[^/.]+$/, '')}_page_${p.pageNumber}.${format === 'jpeg' ? 'jpg' : format}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Save</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPORT READY ZIP CARD */}
            {hasExported && zipBlob && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedCount} Pages Rendered Successfully!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatBytes(zipBlob.size)} &bull; ZIP Package containing all .{format} images
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Resolution DPI, Image Format & Action */}
          <div className="lg:col-span-5 space-y-5">
            {/* Format Choice */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Output Image Format</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select image encoding for rendered pages.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'png', label: 'PNG Lossless', sub: 'Crisp Text' },
                  { id: 'webp', label: 'WebP Smart', sub: 'Smallest' },
                  { id: 'jpeg', label: 'JPEG Photo', sub: 'Universal' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      format === fmt.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{fmt.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{fmt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution & DPI Settings */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Render Resolution & Fidelity</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Target DPI
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '72', label: '72 DPI', sub: 'Fast Web' },
                    { id: '150', label: '150 DPI', sub: 'Standard' },
                    { id: '300', label: '300 DPI', sub: 'Ultra-HD Print' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDpi(d.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        dpi === d.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{d.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{d.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {format !== 'png' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>Quality Level</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleExportSelected}
                disabled={isExporting || selectedCount === 0}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>
                  {isExporting
                    ? `Converting Page ${exportProgress?.current} of ${exportProgress?.total}...`
                    : `Convert ${selectedCount} ${selectedCount === 1 ? 'Page' : 'Pages'} to ${format.toUpperCase()}`}
                </span>
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Extraction • Rendered securely in your browser</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUICK PREVIEW */}
      {modalPageNumber !== null && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-4 space-y-3 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Quick Preview &bull; Page {modalPageNumber} of {totalPages}
              </h4>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="min-h-[380px] max-h-[70vh] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2">
              {isModalLoading ? (
                <div className="text-xs text-slate-400 animate-pulse">Rendering high-res preview...</div>
              ) : modalImageUrl ? (
                <img
                  src={modalImageUrl}
                  alt={`Preview Page ${modalPageNumber}`}
                  className="max-h-[66vh] max-w-full object-contain"
                />
              ) : (
                <div className="text-xs text-rose-400">Failed to render preview</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
