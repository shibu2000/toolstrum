/**
 * index.ts
 * Barrel export for Document Scanner Studio consolidated workspaces and configurations.
 */

export * from './scannerConfig';
export * from './shared/ScannerEngine';
export * from './shared/ScannerHelpers';
export * from './shared/ScannerCaptureBox';
export * from './shared/ScannerResultCard';

export { ScannerCaptureWorkspace } from './ScannerCaptureWorkspace';
export { ScannerEnhanceWorkspace } from './ScannerEnhanceWorkspace';
export { ScannerOcrWorkspace } from './ScannerOcrWorkspace';
export { ScannerExportWorkspace } from './ScannerExportWorkspace';
export { ScannerManagerWorkspace } from './ScannerManagerWorkspace';
