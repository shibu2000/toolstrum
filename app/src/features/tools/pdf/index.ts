/**
 * PDF Studio Workspace Exports
 * Consolidates tools 1–48 into 7 reusable workspaces.
 */

export * from './pdfConfig';
export * from './PdfCreationWorkspace';       // Workspace A (1, 2, 3, 8, 31, 32, 33, 34, 35)
export * from './PdfPageManagerWorkspace';     // Workspace B (4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 40, 45)
export * from './PdfOptimizationWorkspace';    // Workspace C (6, 17, 18, 19, 20, 21, 39, 41, 44)
export * from './PdfViewerWorkspace';          // Workspace D (23, 24, 25, 26)
export * from './PdfConversionWorkspace';      // Workspace E (7, 27, 28, 29, 30, 36, 42, 43)
export * from './PdfInspectionWorkspace';      // Workspace F (22, 37, 38, 46, 48)
export * from './PdfBatchWorkspace';           // Workspace G (47)
export * from './shared/PdfEngine';
export * from './shared/PdfFilePicker';
export * from './shared/PdfResultCard';
