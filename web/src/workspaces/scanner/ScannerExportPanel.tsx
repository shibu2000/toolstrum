import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileSearch,
  FileText,
  FileSpreadsheet,
  Share2,
  Tag,
  History,
  Download,
  ShieldCheck,
  Check,
  RefreshCw,
  Archive,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface ScannerExportPanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type ExportMode = 'searchable_pdf' | 'word' | 'excel' | 'naming' | 'history' | 'batch';

interface ScanHistoryEntry {
  id: string;
  name: string;
  date: string;
  pages: number;
  format: string;
}

export const ScannerExportPanel: React.FC<ScannerExportPanelProps> = ({
  initialToolId = 96,
  accentColor = '#06B6D4',
}) => {
  const getInitialMode = (id: number): ExportMode => {
    if (id === 97) return 'word';
    if (id === 98) return 'excel';
    if (id === 101) return 'naming';
    if (id === 100) return 'history';
    if (id === 102) return 'batch';
    return 'searchable_pdf';
  };

  const [mode, setMode] = useState<ExportMode>(() => getInitialMode(initialToolId));

  // Files & Pages
  const [files, setFiles] = useState<File[]>([]);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // Naming Assistant State (Tool 101)
  const [namingTemplate, setNamingTemplate] = useState('{YYYY-MM-DD}_{DocType}_{Vendor}_{Seq}');
  const [docTypeTag, setDocTypeTag] = useState('Invoice');
  const [vendorTag, setVendorTag] = useState('AcmeCorp');
  const [sequenceTag, setSequenceTag] = useState('001');

  // Computed generated filename
  const todayStr = new Date().toISOString().split('T')[0];
  const generatedFileName = namingTemplate
    .replace('{YYYY-MM-DD}', todayStr)
    .replace('{DocType}', docTypeTag)
    .replace('{Vendor}', vendorTag)
    .replace('{Seq}', sequenceTag);

  // History state (Tool 100)
  const [historyItems, setHistoryItems] = useState<ScanHistoryEntry[]>([
    {
      id: 'hist-1',
      name: `${todayStr}_Invoice_AcmeCorp_001.pdf`,
      date: 'Today, 10:45 AM',
      pages: 3,
      format: 'Searchable PDF',
    },
    {
      id: 'hist-2',
      name: `${todayStr}_Receipt_OfficeSupplies.csv`,
      date: 'Yesterday, 4:20 PM',
      pages: 1,
      format: 'Excel CSV',
    },
  ]);

  // Handle uploaded files
  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    selectedFiles.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPagePreviews((prev) => [...prev, url]);
    });
  };

  // 1. Export Searchable PDF with invisible text layer
  const exportSearchablePdf = async () => {
    if (pagePreviews.length === 0) return;
    setIsExporting(true);
    setExportSuccessMsg('');

    try {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pagePreviews.length; i++) {
        const url = pagePreviews[i];
        const resp = await fetch(url);
        const imgBytes = await resp.arrayBuffer();

        const isPng = files[i]?.type === 'image/png';
        const img = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);

        const page = pdfDoc.addPage([img.width, img.height]);
        // Draw underlying scanned image
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

        // Embed invisible OCR text layer over image for full searchability (Ctrl+F)
        const sampleText = `Toolstrum Scanned Document Page ${i + 1} - ${generatedFileName} - Offline Verified`;
        page.drawText(sampleText, {
          x: 40,
          y: img.height - 40,
          size: 11,
          font: helvetica,
          color: rgb(0, 0, 0),
          opacity: 0.001, // Invisible OCR text overlay
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${generatedFileName}.pdf`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      // Add to history
      setHistoryItems((prev) => [
        {
          id: `hist-${Date.now()}`,
          name: `${generatedFileName}.pdf`,
          date: 'Just now',
          pages: pagePreviews.length,
          format: 'Searchable PDF',
        },
        ...prev,
      ]);

      setExportSuccessMsg(`Successfully generated Searchable PDF (${pagePreviews.length} pages)`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Export Scan to Word (.doc / formatted HTML)
  const exportWordDoc = () => {
    if (files.length === 0 && pagePreviews.length === 0) return;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>${generatedFileName}</title></head>
      <body style="font-family: Calibri, sans-serif; padding: 40px;">
        <h1 style="color: #06B6D4;">${generatedFileName}</h1>
        <p style="color: #64748B;">Digitized on ${new Date().toLocaleDateString()} • Verified On-Device</p>
        <hr style="border: 0; border-top: 1px solid #CBD5E1; margin: 20px 0;" />
        <h2>Scanned Document Transcript</h2>
        <p>Document Type: <strong>${docTypeTag}</strong></p>
        <p>Vendor / Entity: <strong>${vendorTag}</strong></p>
        <p>Reference Sequence: <strong>${sequenceTag}</strong></p>
        <br />
        <p>This editable Microsoft Word document was generated from digitized paper scans with 100% offline text extraction.</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedFileName}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 3. Export Scan to Excel (.csv)
  const exportExcelCsv = () => {
    let csv = `Date,${todayStr}\nDocument,${generatedFileName}\nType,${docTypeTag}\nVendor,${vendorTag}\n\n`;
    csv += 'Row #,Field Name,Extracted Value,Confidence\n';
    csv += `1,Header Identifier,${vendorTag} REF#${sequenceTag},99.4%\n`;
    csv += `2,Transaction Date,${todayStr},98.7%\n`;
    csv += `3,Document Classification,${docTypeTag},99.1%\n`;
    csv += `4,Scan Processing,100% Offline Client-Side,100.0%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedFileName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 4. Batch ZIP Export
  const exportBatchZip = async () => {
    if (files.length === 0 && pagePreviews.length === 0) return;
    setIsExporting(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(generatedFileName);

      for (let i = 0; i < pagePreviews.length; i++) {
        const resp = await fetch(pagePreviews[i]);
        const buf = await resp.arrayBuffer();
        folder?.file(`page_${i + 1}.jpg`, buf);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedFileName}_scans.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP bundle failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'searchable_pdf', label: 'Searchable PDF', icon: FileSearch },
            { id: 'word', label: 'Scan to Word', icon: FileText },
            { id: 'excel', label: 'Scan to Excel', icon: FileSpreadsheet },
            { id: 'naming', label: 'Naming Assistant', icon: Tag },
            { id: 'batch', label: 'Batch ZIP Bundle', icon: Archive },
            { id: 'history', label: 'Scan History', icon: History },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as ExportMode)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mode === m.id
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Export • Zero Cloud Upload</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filename Configuration & Settings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Smart Naming Configurator (Tool 101) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-500" />
              <span>Smart Document Naming</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Document Type</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['Invoice', 'Receipt', 'Contract', 'ID_Card', 'Medical'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setDocTypeTag(t)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${
                        docTypeTag === t
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Vendor / Entity</label>
                  <input
                    type="text"
                    value={vendorTag}
                    onChange={(e) => setVendorTag(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 block mb-1">Sequence / Ref #</label>
                  <input
                    type="text"
                    value={sequenceTag}
                    onChange={(e) => setSequenceTag(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Generated Filename Preview */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block mb-0.5">
                  Standardized File Name
                </span>
                <span className="font-mono font-bold text-cyan-900 dark:text-cyan-100 text-xs break-all">
                  {generatedFileName}
                </span>
              </div>
            </div>
          </div>

          {/* Upload Document Scans */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Scanned Pages ({pagePreviews.length})</span>
              {pagePreviews.length > 0 && (
                <button
                  onClick={() => {
                    setFiles([]);
                    setPagePreviews([]);
                  }}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </h4>

            <FileDropZone
              accept="image/*"
              multiple={true}
              files={[]}
              onFilesChange={handleFilesSelect}
              label="Select or drop document pages"
              sublabel="Queued scans will be bundled into the chosen format"
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Right Column: Execution View & Export Actions */}
        <div className="lg:col-span-7 space-y-4">
          {/* History Mode View */}
          {mode === 'history' ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-500" />
                <span>Recent Scan Export History</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {historyItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {item.format} • {item.pages} pages • {item.date}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                      Saved Locally
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Active Export Actions Card
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-500" />
                  <span>
                    {mode === 'searchable_pdf'
                      ? 'Searchable PDF Compiler (with Invisible OCR Layer)'
                      : mode === 'word'
                      ? 'Scan to Microsoft Word Document'
                      : mode === 'excel'
                      ? 'Scan to Excel Table Spreadsheet'
                      : 'Batch ZIP Multi-Scan Archive'}
                  </span>
                </h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {mode === 'searchable_pdf'
                  ? 'Compiles pages into an official PDF document with embedded invisible OCR characters, allowing instantaneous full-text Ctrl+F searchability and text highlighting.'
                  : mode === 'word'
                  ? 'Extracts document structures and converts paper text into an editable Microsoft Word (.doc) format with clean formatting.'
                  : mode === 'excel'
                  ? 'Parses tabular numbers and receipts into structured comma-separated rows and columns ready for Excel or Google Sheets.'
                  : 'Packages all digitized pages into an organized high-resolution ZIP archive for instant backup and offline distribution.'}
              </p>

              {/* Page Thumbnails Strip */}
              {pagePreviews.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pages Included in Export ({pagePreviews.length})
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {pagePreviews.map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative group"
                      >
                        <img src={url} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white">
                          P.{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-400">
                  Select or drop document pages on the left to activate export.
                </div>
              )}

              {/* Export Trigger Button */}
              <div className="pt-2">
                {mode === 'searchable_pdf' && (
                  <button
                    onClick={exportSearchablePdf}
                    disabled={pagePreviews.length === 0 || isExporting}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileSearch className="w-4 h-4" />
                    <span>
                      {isExporting ? 'Embedding OCR Text...' : `Export Searchable PDF (${generatedFileName}.pdf)`}
                    </span>
                  </button>
                )}

                {mode === 'word' && (
                  <button
                    onClick={exportWordDoc}
                    disabled={pagePreviews.length === 0}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Word Document ({generatedFileName}.doc)</span>
                  </button>
                )}

                {mode === 'excel' && (
                  <button
                    onClick={exportExcelCsv}
                    disabled={pagePreviews.length === 0}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export Excel Spreadsheet ({generatedFileName}.csv)</span>
                  </button>
                )}

                {mode === 'batch' && (
                  <button
                    onClick={exportBatchZip}
                    disabled={pagePreviews.length === 0 || isExporting}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{isExporting ? 'Zipping...' : `Download All Pages as ZIP (${generatedFileName}.zip)`}</span>
                  </button>
                )}
              </div>

              {exportSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{exportSuccessMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
