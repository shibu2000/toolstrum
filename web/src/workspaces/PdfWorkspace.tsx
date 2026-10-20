import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import {
  FileText,
  Download,
  Check,
  ShieldCheck,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Layers,
  Camera,
  CameraOff,
  Scan,
  Sliders,
  RotateCw,
  Scissors,
  Plus,
  ArrowUp,
  ArrowDown,
  Minimize2,
  Type,
  Copy,
  FileCode2,
  FileSearch,
  Crop,
  Hash,
  Layers3,
  Unlock,
} from 'lucide-react';
import { FileDropZone } from '../components/common/FileDropZone';
import { ResultCard } from '../components/common/ResultCard';
import { getToolById } from '../data/webRegistry';
import { extractPdfText, extractPdfTextByPage } from '../utils/pdfText';

interface PdfWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export type PdfToolMode =
  | 'scan_to_pdf'
  | 'merge_pdf'
  | 'images_to_pdf'
  | 'split_pdf'
  | 'compress_pdf'
  | 'rotate_pdf'
  | 'delete_pages'
  | 'watermark_pdf'
  | 'sign_pdf'
  | 'pdf_to_text'
  | 'pdf_to_markdown'
  | 'pdf_inspector'
  | 'crop_pdf'
  | 'add_page_numbers'
  | 'pdf_flatten'
  | 'unlock_pdf';

interface ScannedPageItem {
  id: string;
  dataUrl: string;
  name: string;
}

// Process camera or uploaded document photo with scanner filters
const processScannedImage = (
  sourceImg: HTMLImageElement | HTMLVideoElement,
  filter: 'document_bw' | 'enhanced' | 'grayscale' | 'original',
  threshold = 135
): string => {
  const canvas = document.createElement('canvas');
  const width = 'videoWidth' in sourceImg ? sourceImg.videoWidth : sourceImg.naturalWidth || sourceImg.width;
  const height = 'videoHeight' in sourceImg ? sourceImg.videoHeight : sourceImg.naturalHeight || sourceImg.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(sourceImg, 0, 0, width, height);

  if (filter === 'original') {
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  if (filter === 'document_bw') {
    // High contrast black-and-white document scan: whiten background, darken ink
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const val = lum > threshold ? 255 : 0;
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
  } else if (filter === 'enhanced') {
    // Color document enhanced: boost contrast, whiten light paper, preserve colored ink
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.min(255, Math.max(0, (d[i] - 128) * 1.35 + 138));
      d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - 128) * 1.35 + 138));
      d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - 128) * 1.35 + 138));
    }
  } else if (filter === 'grayscale') {
    for (let i = 0; i < d.length; i += 4) {
      const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      d[i] = lum;
      d[i + 1] = lum;
      d[i + 2] = lum;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
};

export const PdfWorkspace: React.FC<PdfWorkspaceProps> = ({
  toolId,
  accentColor = '#FF6B6B',
}) => {
  // Determine mode strictly based on toolId
  const getInitialMode = (id: number): PdfToolMode => {
    if (id === 3) return 'scan_to_pdf';
    if (id === 4 || id === 48) return 'merge_pdf';
    if (id === 1 || id === 8) return 'images_to_pdf';
    if (id === 5 || id === 12 || id === 13) return 'split_pdf';
    if (id === 6 || id === 41) return 'compress_pdf';
    if (id === 9 || id === 10) return 'rotate_pdf';
    if (id === 11) return 'delete_pages';
    if (id === 18) return 'watermark_pdf';
    if (id === 25 || id === 26) return 'sign_pdf';
    if (id === 27) return 'pdf_to_text';
    if (id === 42) return 'pdf_to_markdown';
    if (id === 46) return 'pdf_inspector';
    if (id === 15) return 'crop_pdf';
    if (id === 17) return 'add_page_numbers';
    if (id === 39) return 'pdf_flatten';
    if (id === 20) return 'unlock_pdf';
    return 'merge_pdf';
  };

  const [activeTab, setActiveTab] = useState<PdfToolMode>(() => getInitialMode(toolId));

  // Common file & output state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('document.pdf');
  const [errorMsg, setErrorMsg] = useState('');

  // ==========================================
  // SCAN TO PDF STATE (Tool 3)
  // ==========================================
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);
  const [scanFilter, setScanFilter] = useState<'document_bw' | 'enhanced' | 'grayscale' | 'original'>('document_bw');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      setCameraError('Camera access unavailable. You can upload photos of your document below instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCurrentFrame = () => {
    if (!videoRef.current) return;
    const dataUrl = processScannedImage(videoRef.current, scanFilter);
    if (!dataUrl) return;
    setScannedPages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2, 9),
        dataUrl,
        name: `Scanned Page ${prev.length + 1}`,
      },
    ]);
  };

  const handleAddPhotosToScan = (files: File[]) => {
    for (const f of files) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        const dataUrl = processScannedImage(img, scanFilter);
        setScannedPages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).slice(2, 9),
            dataUrl,
            name: f.name,
          },
        ]);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleCompileScannedPdf = async () => {
    if (scannedPages.length === 0) {
      setErrorMsg('Please capture or upload at least one document page.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const pageItem of scannedPages) {
        const res = await fetch(pageItem.dataUrl);
        const buf = await res.arrayBuffer();
        const img = await pdfDoc.embedJpg(new Uint8Array(buf));
        const pdfPage = pdfDoc.addPage([img.width, img.height]);
        pdfPage.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename('scanned-document.pdf');
    } catch (e: any) {
      setErrorMsg(`Failed to compile scanned PDF: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // MERGE PDF STATE (Tool 4)
  // ==========================================
  const handleMergePdfs = async () => {
    if (selectedFiles.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of selectedFiles) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename('toolstrum-merged.pdf');
    } catch (e: any) {
      setErrorMsg(`PDF Merge failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const moveFileOrder = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...selectedFiles];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIdx];
    newFiles[targetIdx] = temp;
    setSelectedFiles(newFiles);
  };

  // ==========================================
  // IMAGES TO PDF (Tool 1)
  // ==========================================
  const handleImagesToPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least one image file (JPG or PNG).');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of selectedFiles) {
        const imgBuffer = await file.arrayBuffer();
        let img;
        if (file.type === 'image/png' || file.name.endsWith('.png')) {
          img = await pdfDoc.embedPng(imgBuffer);
        } else {
          img = await pdfDoc.embedJpg(imgBuffer);
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename('images-to-pdf.pdf');
    } catch (e: any) {
      setErrorMsg(`Images to PDF conversion failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // SPLIT PDF (Tool 5)
  // ==========================================
  const [pageRangeInput, setPageRangeInput] = useState('1-2');

  const handleSplitPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file to split.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer);
      const totalPages = srcDoc.getPageCount();

      const indicesToExtract: number[] = [];
      const parts = pageRangeInput.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(totalPages, parseInt(endStr, 10));
          for (let i = start; i <= end; i++) indicesToExtract.push(i - 1);
        } else {
          const p = parseInt(trimmed, 10);
          if (p >= 1 && p <= totalPages) indicesToExtract.push(p - 1);
        }
      }

      const uniqueIndices = Array.from(new Set(indicesToExtract));
      if (uniqueIndices.length === 0) {
        setErrorMsg(`Invalid page range. This document has ${totalPages} pages.`);
        setIsProcessing(false);
        return;
      }

      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(srcDoc, uniqueIndices);
      copied.forEach((p) => outDoc.addPage(p));

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`split-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`PDF Split failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // COMPRESS PDF (Tool 6)
  // ==========================================
  const handleCompressPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);

      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`compressed-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`PDF Compression failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // ROTATE PDF (Tool 9)
  // ==========================================
  const [rotateAngle, setRotateAngle] = useState(90);

  const handleRotatePdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file to rotate.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((p) => {
        const currentAngle = p.getRotation().angle;
        p.setRotation(degrees((currentAngle + rotateAngle) % 360));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`rotated-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`PDF Rotation failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // DELETE PAGES (Tool 11)
  // ==========================================
  const [deletePagesInput, setDeletePagesInput] = useState('1');

  const handleDeletePages = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const totalPages = pdfDoc.getPageCount();

      const toDelete = deletePagesInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10) - 1)
        .filter((n) => !isNaN(n) && n >= 0 && n < totalPages)
        .sort((a, b) => b - a);

      if (toDelete.length >= totalPages) {
        setErrorMsg('Cannot delete all pages in the PDF.');
        setIsProcessing(false);
        return;
      }

      for (const idx of toDelete) {
        pdfDoc.removePage(idx);
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`edited-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`Delete pages failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // WATERMARK (Tool 18, 20)
  // ==========================================
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');

  const handleAddWatermark = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file to watermark.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 42,
          color: rgb(0.8, 0.2, 0.2),
          opacity: 0.35,
          rotate: degrees(45),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`watermarked-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`Watermark error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // CROP PDF (Tool 15)
  // ==========================================
  const [cropMarginPercent, setCropMarginPercent] = useState(10);

  const handleCropPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const marginX = (width * cropMarginPercent) / 100;
        const marginY = (height * cropMarginPercent) / 100;
        page.setCropBox(marginX, marginY, width - marginX * 2, height - marginY * 2);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`cropped-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`Crop failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // ADD PAGE NUMBERS (Tool 17)
  // ==========================================
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right'>('bottom-center');

  const handleAddPageNumbers = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        const { width } = page.getSize();
        const label = `${idx + 1} / ${pages.length}`;
        const x = pageNumberPosition === 'bottom-center' ? width / 2 - 10 : width - 60;
        page.drawText(label, { x, y: 24, size: 10, color: rgb(0.3, 0.3, 0.3) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`numbered-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`Adding page numbers failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // PDF FLATTEN (Tool 39)
  // ==========================================
  const handleFlattenPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer);
      const form = pdfDoc.getForm();
      const fieldCount = form.getFields().length;

      if (fieldCount === 0) {
        setErrorMsg('This PDF has no fillable form fields to flatten. Nothing to change.');
        return;
      }

      form.flatten();
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`flattened-${file.name}`);
    } catch (e: any) {
      setErrorMsg(`Flatten failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // UNLOCK PDF (Tool 20) — strips owner-password print/edit restrictions.
  // Cannot open PDFs that require a password just to view (not supported client-side).
  // ==========================================
  const handleUnlockPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      if (!pdfDoc.isEncrypted) {
        setErrorMsg('This PDF is not password-protected or restricted — nothing to unlock.');
        return;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      setOutputFilename(`unlocked-${file.name}`);
    } catch (e: any) {
      setErrorMsg('This PDF requires a password just to open it, which cannot be removed without knowing that password — only print/edit restrictions can be lifted here.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // PDF TO TEXT (Tool 27)
  // ==========================================
  const [extractedText, setExtractedText] = useState('');
  const [hasCopiedText, setHasCopiedText] = useState(false);

  const handlePdfToText = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const file = selectedFiles[0];
      const text = await extractPdfText(file);

      if (!text.trim()) {
        setErrorMsg('No extractable text found. This PDF may be a scanned image without a text layer — try an OCR tool instead.');
        setExtractedText('');
        setOutputBlob(null);
        return;
      }

      setExtractedText(text);
      const blob = new Blob([text], { type: 'text/plain' });
      setOutputBlob(blob);
      setOutputFilename(`${file.name.replace(/\.[^/.]+$/, '')}_text.txt`);
    } catch (e: any) {
      setErrorMsg(`Text extraction failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // PDF TO MARKDOWN (Tool 42)
  // ==========================================
  const handlePdfToMarkdown = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const pages = await extractPdfTextByPage(file);
      if (pages.every((p) => !p.text.trim())) {
        setErrorMsg('No extractable text found. This PDF may be a scanned image without a text layer.');
        return;
      }
      const markdown = pages
        .map((p) => `## Page ${p.pageNumber}\n\n${p.text || '*(no text on this page)*'}`)
        .join('\n\n---\n\n');
      setExtractedText(markdown);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      setOutputBlob(blob);
      setOutputFilename(`${file.name.replace(/\.[^/.]+$/, '')}.md`);
    } catch (e: any) {
      setErrorMsg(`Markdown conversion failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // PDF FILE INSPECTOR (Tool 46)
  // ==========================================
  const [inspectorReport, setInspectorReport] = useState('');

  const handleInspectPdf = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select a PDF file.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle() || '(untitled)';
      const author = pdfDoc.getAuthor() || '(unknown)';
      const subject = pdfDoc.getSubject() || '(none)';
      const creator = pdfDoc.getCreator() || '(unknown)';
      const created = pdfDoc.getCreationDate();
      const isEncrypted = pdfDoc.isEncrypted;
      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      const report = `Title: ${title}\nAuthor: ${author}\nSubject: ${subject}\nCreator Application: ${creator}\nCreated: ${created ? created.toLocaleString() : '(unknown)'}\nPages: ${pageCount}\nFirst Page Size: ${width.toFixed(0)} x ${height.toFixed(0)} pt\nFile Size: ${formatSize(file.size)}\nEncrypted: ${isEncrypted ? 'Yes' : 'No'}`;
      setInspectorReport(report);
      const blob = new Blob([report], { type: 'text/plain' });
      setOutputBlob(blob);
      setOutputFilename(`${file.name.replace(/\.[^/.]+$/, '')}_inspection.txt`);
    } catch (e: any) {
      setErrorMsg(`Inspection failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // SIGNATURE PAD (Tool 25)
  // ==========================================
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#171A2E';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const resetState = () => {
    setSelectedFiles([]);
    setOutputBlob(null);
    setErrorMsg('');
    setExtractedText('');
  };

  // Sync tab on toolId change
  useEffect(() => {
    setActiveTab(getInitialMode(toolId));
    resetState();
  }, [toolId]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <FileText className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'PDF Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Scan, merge, convert, watermark, and sign PDF documents. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SCAN TO PDF (Tool 3) - REAL DOCUMENT SCANNER! */}
      {/* ======================================================== */}
      {activeTab === 'scan_to_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scan className="w-4 h-4 text-rose-500" />
                <span>Document Scanner to PDF</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scan physical paperwork with your camera or upload document photos. Filters automatically clean up page shadows and glare.
              </p>
            </div>

            {/* Filter Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Scanner Filter
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'document_bw', label: 'Document B&W', desc: 'Crisp black text' },
                  { id: 'enhanced', label: 'Enhanced Color', desc: 'Vibrant stamps/ink' },
                  { id: 'grayscale', label: 'Photocopy Gray', desc: 'Archive copy' },
                  { id: 'original', label: 'Photo Original', desc: 'Raw picture' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setScanFilter(f.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      scanFilter === f.id
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{f.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Camera Viewfinder
                </span>
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Close Camera</span>
                  </button>
                )}
              </div>

              {cameraError && (
                <p className="text-xs text-amber-600 dark:text-amber-400">{cameraError}</p>
              )}

              {isCameraActive && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-700">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Framing Overlay Guides */}
                  <div className="absolute inset-6 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="bg-black/60 px-2.5 py-1 rounded-md text-[11px] text-white font-medium">
                      Align document edges within guide
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={captureCurrentFrame}
                    className="absolute bottom-4 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Capture Page</span>
                  </button>
                </div>
              )}
            </div>

            {/* Alternative: Upload Document Photos */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                Or Upload Document Photos / Receipts
              </label>
              <FileDropZone
                accept="image/*"
                multiple
                label="Drop photos of documents to scan"
                sublabel="JPG, PNG • Camera scan filters applied automatically"
                files={[]}
                onFilesChange={handleAddPhotosToScan}
                accentColor={accentColor}
              />
            </div>

            {/* Compile PDF Button */}
            <button
              onClick={handleCompileScannedPdf}
              disabled={isProcessing || scannedPages.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Compiling Scanned PDF...'
                  : `Compile Scanned PDF (${scannedPages.length} Page${scannedPages.length === 1 ? '' : 's'})`}
              </span>
            </button>
          </div>

          {/* Right Column: Scanned Pages Tray & Result */}
          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scanned PDF Created Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {scannedPages.length} scanned pages compiled • {formatSize(outputBlob.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Scanned PDF Document</span>
                </a>

                <button
                  onClick={() => {
                    setOutputBlob(null);
                    setScannedPages([]);
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Start New Scan
                </button>
              </div>
            ) : scannedPages.length > 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Scanned Pages Tray ({scannedPages.length})
                  </h4>
                  <button
                    onClick={() => setScannedPages([])}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                  {scannedPages.map((page, idx) => (
                    <div
                      key={page.id}
                      className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 space-y-1.5"
                    >
                      <div className="aspect-3/4 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                        <img
                          src={page.dataUrl}
                          alt={page.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Page {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setScannedPages((prev) => prev.filter((p) => p.id !== page.id))}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Open your camera to snap document pages, or drop paper photos. Cleaned and compiled into PDF 100% offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MERGE PDF (Tool 4) - STRICTLY COMBINES EXISTING PDFS! */}
      {/* ======================================================== */}
      {activeTab === 'merge_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" />
                <span>Merge PDF Documents</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Combine 2 or more existing PDF files into one complete document in your exact preferred sequence.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple
              label="Select 2 or more PDF files to merge"
              sublabel="Files will be merged in the order listed below"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <button
              onClick={handleMergePdfs}
              disabled={isProcessing || selectedFiles.length < 2}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>{isProcessing ? 'Merging PDFs...' : `Merge ${selectedFiles.length || ''} PDF Documents Now`}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      PDFs Merged Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Combined file size: {formatSize(outputBlob.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Merged PDF</span>
                </a>

                <button
                  onClick={resetState}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Merge Another Batch
                </button>
              </div>
            ) : selectedFiles.length > 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Documents to Merge ({selectedFiles.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400 text-[11px] mr-1">{formatSize(f.size)}</span>
                        <button
                          type="button"
                          onClick={() => moveFileOrder(i, 'up')}
                          disabled={i === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFileOrder(i, 'down')}
                          disabled={i === selectedFiles.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select at least 2 PDF files to merge them into one document. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. IMAGES TO PDF (Tool 1) */}
      {/* ======================================================== */}
      {activeTab === 'images_to_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-rose-500" />
                <span>Convert Images to PDF</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select one or more images to combine into a single PDF document.
              </p>
            </div>

            <FileDropZone
              accept="image/*"
              multiple
              label="Select or drop images"
              sublabel="Supports JPG, PNG • 100% Offline • 100% Secure"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <button
              onClick={handleImagesToPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isProcessing ? 'Creating PDF Document...' : `Convert ${selectedFiles.length || ''} Images to PDF`}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      PDF Created Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedFiles.length} images converted ({formatSize(outputBlob.size)})
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </a>

                <button
                  onClick={resetState}
                  className="w-full py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Convert Another Batch
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your image files and click Convert. Combined into a standard PDF document locally on your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SPLIT PDF (Tool 5) */}
      {/* ======================================================== */}
      {activeTab === 'split_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-rose-500" />
                <span>Split PDF & Extract Pages</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Extract specific pages or page ranges from a PDF document.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select a PDF file to split"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Pages to Extract (e.g. 1-2, 4)
              </label>
              <input
                type="text"
                value={pageRangeInput}
                onChange={(e) => setPageRangeInput(e.target.value)}
                placeholder="1-2"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleSplitPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>{isProcessing ? 'Splitting PDF...' : 'Extract Pages & Save PDF'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pages Extracted Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      File size: {formatSize(outputBlob.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Extracted PDF</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter the page range you want to extract and click Split. Processed 100% offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. COMPRESS PDF (Tool 6) */}
      {/* ======================================================== */}
      {activeTab === 'compress_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Minimize2 className="w-4 h-4 text-rose-500" />
                <span>Compress PDF Document</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Optimize and compact internal object streams to shrink PDF file size.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to compress"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <button
              onClick={handleCompressPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{isProcessing ? 'Optimizing PDF...' : 'Compress PDF Now'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      PDF Compressed Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Optimized size: {formatSize(outputBlob.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Compresses internal PDF structure for email or web upload.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. ROTATE PDF (Tool 9) */}
      {/* ======================================================== */}
      {activeTab === 'rotate_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-rose-500" />
                <span>Rotate PDF Pages</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rotate orientation across all pages of your PDF document.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to rotate"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <div className="grid grid-cols-3 gap-2">
              {[
                { angle: 90, label: '90° Clockwise' },
                { angle: 180, label: '180° Flip' },
                { angle: 270, label: '270° (Left 90°)' },
              ].map((r) => (
                <button
                  key={r.angle}
                  type="button"
                  onClick={() => setRotateAngle(r.angle)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    rotateAngle === r.angle
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRotatePdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>{isProcessing ? 'Rotating PDF...' : `Rotate Pages ${rotateAngle}° & Save`}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      PDF Rotated Successfully!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Orientation saved
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Rotated PDF</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your rotation angle and apply to all pages instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. DELETE PAGES (Tool 11) */}
      {/* ======================================================== */}
      {activeTab === 'delete_pages' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete PDF Pages</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Remove specific unwanted pages from your PDF document.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Pages to Delete (e.g. 1, 3)
              </label>
              <input
                type="text"
                value={deletePagesInput}
                onChange={(e) => setDeletePagesInput(e.target.value)}
                placeholder="1"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleDeletePages}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isProcessing ? 'Removing Pages...' : 'Delete Selected Pages & Save'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pages Removed Successfully!
                    </h4>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Edited PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. WATERMARK (Tool 18, 20) */}
      {/* ======================================================== */}
      {activeTab === 'watermark_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-rose-500" />
                <span>Add Watermark to PDF</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apply a diagonal text watermark stamp across every page.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Watermark Text
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-semibold"
              />
            </div>

            <button
              onClick={handleAddWatermark}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Type className="w-4 h-4" />
              <span>{isProcessing ? 'Watermarking PDF...' : 'Apply Watermark Now'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {outputBlob && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Watermark Applied!
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Stamped with: "{watermarkText}"
                    </p>
                  </div>
                </div>

                <a
                  href={URL.createObjectURL(outputBlob)}
                  download={outputFilename}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Watermarked PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. DIGITAL SIGNATURE PAD (Tool 25) */}
      {/* ======================================================== */}
      {activeTab === 'sign_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-rose-500" />
                  <span>Draw Digital Signature</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign with your mouse or touchscreen to save a transparent PNG signature.
                </p>
              </div>
              <button
                onClick={clearSignature}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white overflow-hidden">
              <canvas
                ref={sigCanvasRef}
                width={400}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-40 cursor-crosshair"
              />
            </div>

            <button
              onClick={() => {
                if (sigCanvasRef.current && hasDrawnSignature) {
                  const dataUrl = sigCanvasRef.current.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = dataUrl;
                  a.download = 'my-signature.png';
                  a.click();
                }
              }}
              disabled={!hasDrawnSignature}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Save Transparent Signature (PNG)</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white">
              100% Offline • 100% Secure
            </h4>
            <p>
              Your digital signature is created completely on your local device with transparent background support.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Transparent background for signing contracts and documents</li>
              <li>Ready to insert into Adobe Acrobat, Apple Preview, or Google Docs</li>
              <li>Never saved to any cloud or remote server</li>
            </ul>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. PDF TO TEXT (Tool 27) */}
      {/* ======================================================== */}
      {activeTab === 'pdf_to_text' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>Extract Text from PDF</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Extract text and stream contents from a PDF document.
              </p>
            </div>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to extract"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />

            <button
              onClick={handlePdfToText}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>{isProcessing ? 'Extracting Text...' : 'Extract Text Now'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {extractedText ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Extracted Text
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(extractedText);
                      setHasCopiedText(true);
                      setTimeout(() => setHasCopiedText(false), 1500);
                    }}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{hasCopiedText ? 'Copied! ✓' : 'Copy Text'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={extractedText}
                  className="w-full h-48 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 resize-none"
                />

                {outputBlob && (
                  <a
                    href={URL.createObjectURL(outputBlob)}
                    download={outputFilename}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Text File (.txt)</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a PDF to inspect and extract its text content 100% offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pdf_to_markdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-rose-500" />
              <span>PDF to Markdown</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extracts real text per page and formats it as Markdown with page headings.
            </p>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to convert"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <button
              onClick={handlePdfToMarkdown}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Converting...' : 'Convert to Markdown'}
            </button>
          </div>
          <div className="space-y-4">
            {extractedText ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <textarea readOnly value={extractedText} className="w-full h-64 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 resize-none" />
                {outputBlob && (
                  <a href={URL.createObjectURL(outputBlob)} download={outputFilename} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Markdown (.md)</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF to convert its text content to Markdown, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pdf_inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-rose-500" />
              <span>PDF File Inspector</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reads real document metadata: title, author, page count, page size, and encryption status.
            </p>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to inspect"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <button
              onClick={handleInspectPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Inspecting...' : 'Inspect PDF'}
            </button>
          </div>
          <div className="space-y-4">
            {inspectorReport ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <pre className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{inspectorReport}</pre>
                {outputBlob && (
                  <a href={URL.createObjectURL(outputBlob)} download={outputFilename} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Report (.txt)</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF to see its real metadata, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'crop_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crop className="w-4 h-4 text-rose-500" />
              <span>Crop PDF Pages</span>
            </h3>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file to crop"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                <span>Margin to crop from each edge</span>
                <span className="font-mono font-bold">{cropMarginPercent}%</span>
              </div>
              <input type="range" min={0} max={40} value={cropMarginPercent} onChange={(e) => setCropMarginPercent(Number(e.target.value))} className="w-full accent-rose-500" />
            </div>
            <button
              onClick={handleCropPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Cropping...' : 'Crop PDF'}
            </button>
          </div>
          <div>
            {outputBlob ? (
              <ResultCard title="PDF Cropped!" subtitle="Crop box applied to every page" blob={outputBlob} downloadFilename={outputFilename} accentColor={accentColor} />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF and a crop margin, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add_page_numbers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-rose-500" />
              <span>Add Page Numbers</span>
            </h3>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select PDF file"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <div className="flex gap-2">
              {(['bottom-center', 'bottom-right'] as const).map((p) => (
                <button key={p} onClick={() => setPageNumberPosition(p)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${pageNumberPosition === p ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddPageNumbers}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Adding Numbers...' : 'Add Page Numbers'}
            </button>
          </div>
          <div>
            {outputBlob ? (
              <ResultCard title="Page Numbers Added!" subtitle="Every page now has a number stamp" blob={outputBlob} downloadFilename={outputFilename} accentColor={accentColor} />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'pdf_flatten' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-rose-500" />
              <span>Flatten PDF Form</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently bakes fillable form field values into the page content so they can no longer be edited.
            </p>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select a fillable PDF form"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <button
              onClick={handleFlattenPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Flattening...' : 'Flatten Form'}
            </button>
          </div>
          <div>
            {outputBlob ? (
              <ResultCard title="Form Flattened!" subtitle="Field values are now permanent page content" blob={outputBlob} downloadFilename={outputFilename} accentColor={accentColor} />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF with form fields, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'unlock_pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Unlock className="w-4 h-4 text-rose-500" />
              <span>Unlock PDF</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Removes print/copy/edit restrictions on a PDF. This cannot open a PDF that requires a password just to view it.
            </p>
            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select a restricted PDF file"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                setOutputBlob(null);
              }}
              accentColor={accentColor}
            />
            <button
              onClick={handleUnlockPdf}
              disabled={isProcessing || selectedFiles.length === 0}
              className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
            </button>
          </div>
          <div>
            {outputBlob ? (
              <ResultCard title="PDF Unlocked!" subtitle="Restrictions removed" blob={outputBlob} downloadFilename={outputFilename} accentColor={accentColor} />
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a restricted PDF, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
