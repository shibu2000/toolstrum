import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import {
  Trash2,
  Eye,
  Download,
  Check,
  FileText,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Sparkles,
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

interface DeletePagesPanelProps {
  accentColor?: string;
}

export const DeletePagesPanel: React.FC<DeletePagesPanelProps> = ({
  accentColor = '#FF6B6B',
}) => {
  // File & Document State
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfDocProxy, setPdfDocProxy] = useState<any | null>(null);

  // Thumbnails: pageNumber (1-based) -> dataUrl
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const [renderedCount, setRenderedCount] = useState(0);

  // Selection state: 1-based page numbers marked for DELETION
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState<string>('');

  // Processing & Output
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('edited-document.pdf');
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Preview Modal State (ILOVEPDF-style)
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [previewHighResUrl, setPreviewHighResUrl] = useState<string | null>(null);
  const [isLoadingHighRes, setIsLoadingHighRes] = useState(false);

  // Reference to cancel progressive rendering if user switches file
  const renderSessionRef = useRef<number>(0);

  // Format bytes
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Load PDF when file changes
  useEffect(() => {
    if (!file) {
      setTotalPages(0);
      setThumbnails({});
      setDeletedPages(new Set());
      setRangeInput('');
      setOutputBlob(null);
      setErrorMsg('');
      setPdfDocProxy(null);
      return;
    }

    const currentSession = ++renderSessionRef.current;
    let isCancelled = false;

    const loadDocument = async () => {
      setErrorMsg('');
      setOutputBlob(null);
      setThumbnails({});
      setRenderedCount(0);
      setLoadingThumbnails(true);

      try {
        const doc = await getPdfDocument(file);
        if (isCancelled || renderSessionRef.current !== currentSession) {
          doc.destroy?.();
          return;
        }

        const count = doc.numPages;
        setPdfDocProxy(doc);
        setTotalPages(count);
        setDeletedPages(new Set());
        setRangeInput('');

        // Progressively render thumbnails for all pages
        for (let p = 1; p <= count; p++) {
          if (isCancelled || renderSessionRef.current !== currentSession) break;
          try {
            const thumbUrl = await renderPageThumbnail(doc, p, 0.55);
            if (!isCancelled && renderSessionRef.current === currentSession) {
              setThumbnails((prev) => ({ ...prev, [p]: thumbUrl }));
              setRenderedCount(p);
            }
          } catch (err) {
            console.error(`Failed to render page ${p}`, err);
          }
          // Yield to UI thread every page
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } catch (err: any) {
        if (!isCancelled && renderSessionRef.current === currentSession) {
          setErrorMsg(`Unable to load PDF: ${err.message || 'Corrupted or unsupported format.'}`);
        }
      } finally {
        if (!isCancelled && renderSessionRef.current === currentSession) {
          setLoadingThumbnails(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [file]);

  // Load High-Res preview when modal opens or changes page
  useEffect(() => {
    if (!previewPage || !pdfDocProxy) {
      setPreviewHighResUrl(null);
      setIsLoadingHighRes(false);
      return;
    }

    let isCancelled = false;
    setIsLoadingHighRes(true);

    const loadHighRes = async () => {
      try {
        const url = await renderPageHighRes(pdfDocProxy, previewPage, 1.4);
        if (!isCancelled) {
          setPreviewHighResUrl(url);
        }
      } catch (e) {
        console.error('Failed to render high-res page preview', e);
      } finally {
        if (!isCancelled) {
          setIsLoadingHighRes(false);
        }
      }
    };

    loadHighRes();

    return () => {
      isCancelled = true;
    };
  }, [previewPage, pdfDocProxy]);

  // Keyboard navigation for Quick Preview Modal
  useEffect(() => {
    if (previewPage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewPage(null);
      } else if (e.key === 'ArrowLeft') {
        if (previewPage > 1) setPreviewPage(previewPage - 1);
      } else if (e.key === 'ArrowRight') {
        if (previewPage < totalPages) setPreviewPage(previewPage + 1);
      } else if (e.key === 'Delete' || e.key === 'Backspace' || e.key === ' ') {
        e.preventDefault();
        togglePageDeletion(previewPage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewPage, totalPages, deletedPages]);

  // Toggle page in deletion set
  const togglePageDeletion = (pageNum: number) => {
    setDeletedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      setRangeInput(formatPageSelection(next));
      return next;
    });
  };

  // Handle manual range input change (e.g. user types "1-3, 5")
  const handleRangeInputChange = (value: string) => {
    setRangeInput(value);
    if (!totalPages) return;
    const parsed = parsePageSelection(value, totalPages);
    setDeletedPages(parsed);
  };

  // Quick Preset Actions
  const handleSelectAll = () => {
    if (!totalPages) return;
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setDeletedPages(all);
    setRangeInput(formatPageSelection(all));
  };

  const handleClearSelection = () => {
    setDeletedPages(new Set());
    setRangeInput('');
  };

  const handleSelectOdd = () => {
    if (!totalPages) return;
    const odd = new Set<number>();
    for (let i = 1; i <= totalPages; i += 2) odd.add(i);
    setDeletedPages(odd);
    setRangeInput(formatPageSelection(odd));
  };

  const handleSelectEven = () => {
    if (!totalPages) return;
    const even = new Set<number>();
    for (let i = 2; i <= totalPages; i += 2) even.add(i);
    setDeletedPages(even);
    setRangeInput(formatPageSelection(even));
  };

  const handleInvertSelection = () => {
    if (!totalPages) return;
    const inverted = new Set<number>();
    for (let i = 1; i <= totalPages; i++) {
      if (!deletedPages.has(i)) inverted.add(i);
    }
    setDeletedPages(inverted);
    setRangeInput(formatPageSelection(inverted));
  };

  // Process Deletion with pdf-lib
  const handleDeletePages = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF file first.');
      return;
    }

    if (deletedPages.size === 0) {
      setErrorMsg('Please select at least one page to delete.');
      return;
    }

    if (deletedPages.size >= totalPages) {
      setErrorMsg('Cannot delete all pages. At least 1 page must remain in the document.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const count = pdfDoc.getPageCount();

      // Convert 1-based to 0-based and sort descending so removing doesn't shift earlier indices
      const toDeleteIndices = Array.from(deletedPages)
        .map((p) => p - 1)
        .filter((idx) => idx >= 0 && idx < count)
        .sort((a, b) => b - a);

      for (const idx of toDeleteIndices) {
        pdfDoc.removePage(idx);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

      setOutputBlob(blob);
      setOutputFilename(`edited-${file.name.replace(/\.pdf$/i, '')}.pdf`);

      // Celebrate
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      setErrorMsg(`Failed to delete pages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const remainingPagesCount = totalPages - deletedPages.size;

  return (
    <div className="space-y-6">
      {/* Tool Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </span>
              <span>Delete PDF Pages</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Inspect visual previews of all pages, select unwanted pages to remove, and download your clean PDF in seconds. Processed 100% offline in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Private &amp; Offline</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Upload DropZone (Shown when no file selected or to change file) */}
      {!file ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <FileDropZone
            accept="application/pdf"
            multiple={false}
            label="Drop your PDF here, or click to browse"
            files={[]}
            onFilesChange={(files) => {
              if (files.length > 0) setFile(files[0]);
            }}
            accentColor={accentColor}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant Preview</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Full visual thumbnail grid rendered instantly for every page.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">1-Click Selection</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Click pages or type ranges like 1-3, 5 to mark for removal.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Zero Server Upload</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Clean output PDF created directly on your device.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Interactive Page Grid & Controls Workspace */
        <div className="space-y-6">
          {/* File Info Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatSize(file.size)}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {totalPages} {totalPages === 1 ? 'Page' : 'Pages'}
                  </span>
                  {loadingThumbnails && (
                    <>
                      <span>•</span>
                      <span className="text-rose-500 animate-pulse font-medium">
                        Rendering previews ({renderedCount}/{totalPages})...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFile(null);
                setOutputBlob(null);
              }}
              className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Choose Another PDF</span>
            </button>
          </div>

          {/* Sticky / Top Control Toolbar (ILOVEPDF Style) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-4 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status summary */}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      deletedPages.size > 0
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {deletedPages.size} {deletedPages.size === 1 ? 'page' : 'pages'} to delete
                    </span>
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({remainingPagesCount} {remainingPagesCount === 1 ? 'page' : 'pages'} will remain)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Click any thumbnail to toggle deletion, or use quick selectors below.
                </p>
              </div>

              {/* Quick Selectors & Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Select:</span>
                <button
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  All
                </button>
                <button
                  onClick={handleSelectOdd}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Odd
                </button>
                <button
                  onClick={handleSelectEven}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Even
                </button>
                <button
                  onClick={handleInvertSelection}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  Invert
                </button>
                {deletedPages.size > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Range Input & Primary Action Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => handleRangeInputChange(e.target.value)}
                    placeholder="Enter pages to delete, e.g. 1-3, 5, 8"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-rose-500 dark:focus:border-rose-500"
                  />
                  {rangeInput && (
                    <button
                      onClick={handleClearSelection}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Clear range"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleDeletePages}
                disabled={isProcessing || deletedPages.size === 0 || deletedPages.size >= totalPages}
                className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Removing Pages...'
                    : deletedPages.size === 0
                    ? 'Select Pages to Delete'
                    : deletedPages.size >= totalPages
                    ? 'Cannot Delete All Pages'
                    : `Delete ${deletedPages.size} ${
                        deletedPages.size === 1 ? 'Page' : 'Pages'
                      } & Save PDF`}
                </span>
              </button>
            </div>
          </div>

          {/* Results Card (If Output Ready) */}
          {outputBlob && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Check className="w-6 h-6" />
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Pages Removed Successfully!</span>
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      New PDF contains <strong className="text-slate-700 dark:text-slate-300">{remainingPagesCount} pages</strong> (original had {totalPages} pages). File size: {formatSize(outputBlob.size)}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={URL.createObjectURL(outputBlob)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Preview in New Tab</span>
                  </a>

                  <a
                    href={URL.createObjectURL(outputBlob)}
                    download={outputFilename}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Edited PDF</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Page Thumbnails Grid (ILOVEPDF Style) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Document Pages ({totalPages})
              </h4>
              <span className="text-xs text-slate-400">
                Tip: Click thumbnail to mark/unmark • Click eye icon for full preview
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isDeleted = deletedPages.has(pageNum);
                const thumbUrl = thumbnails[pageNum];

                return (
                  <div
                    key={pageNum}
                    onClick={() => togglePageDeletion(pageNum)}
                    className={`group relative rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col ${
                      isDeleted
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    {/* Top card bar with page number and quick actions */}
                    <div className="p-2 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isDeleted
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        #{pageNum}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Quick Preview Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewPage(pageNum);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete toggle button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageDeletion(pageNum);
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isDeleted
                              ? 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40'
                              : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                          title={isDeleted ? 'Keep this page' : 'Delete this page'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail View Container */}
                    <div className="relative aspect-[1/1.414] w-full p-2.5 flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/50">
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={`Page ${pageNum}`}
                          className={`max-w-full max-h-full object-contain rounded-sm shadow-xs transition-opacity duration-200 ${
                            isDeleted ? 'opacity-40 grayscale' : 'opacity-100'
                          }`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-1 animate-pulse">
                          <FileText className="w-6 h-6 stroke-1" />
                          <span className="text-[10px]">Loading...</span>
                        </div>
                      )}

                      {/* Overlays when marked for deletion */}
                      {isDeleted && (
                        <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[0.5px] flex flex-col items-center justify-center gap-1 animate-in fade-in duration-150">
                          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px] shadow-md flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            <span>DELETE</span>
                          </span>
                          <span className="text-[10px] text-rose-800 dark:text-rose-200 font-semibold bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md shadow-xs">
                            Click to Keep
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK PREVIEW MODAL (ILOVEPDF Style) */}
      {/* ======================================================== */}
      {previewPage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPage(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Page {previewPage} of {totalPages}
                </span>

                {deletedPages.has(previewPage) ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    <span>Marked for Deletion</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Keeping Page</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={previewPage <= 1}
                  onClick={() => setPreviewPage(previewPage - 1)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Previous Page (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={previewPage >= totalPages}
                  onClick={() => setPreviewPage(previewPage + 1)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Next Page (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer ml-2"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / High-Res Preview Canvas */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 min-h-[380px]">
              {previewHighResUrl ? (
                <img
                  src={previewHighResUrl}
                  alt={`High resolution preview of page ${previewPage}`}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg bg-white"
                />
              ) : thumbnails[previewPage] ? (
                <div className="relative">
                  <img
                    src={thumbnails[previewPage]}
                    alt={`Preview of page ${previewPage}`}
                    className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md blur-[1px]"
                  />
                  {isLoadingHighRes && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1.5 rounded-full">
                        Rendering high resolution...
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-xs">Loading page preview...</div>
              )}
            </div>

            {/* Modal Footer / Toggle Action */}
            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <span className="text-[11px] text-slate-400">
                Shortcut: Space or Delete toggles deletion • ← / → navigate
              </span>

              <button
                onClick={() => togglePageDeletion(previewPage)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-xs ${
                  deletedPages.has(previewPage)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {deletedPages.has(previewPage) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Restore Page (Keep it)</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete This Page</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
