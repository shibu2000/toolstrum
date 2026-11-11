import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import {
  QrGeneratorTool,
  QrScannerTool,
  BarcodeGeneratorTool,
  BarcodeScannerTool,
  QrCustomizerTool,
  QrBatchGeneratorTool,
  QrHistoryTool,
} from './security/QrBarcodeTools';
import {
  UrlSafetyCheckerTool,
  PasswordStrengthTool,
  RandomPasswordTool,
  PassphraseGeneratorTool,
  SecureNotesTool,
  SecretRedactorTool,
} from './security/PasswordPassphraseTools';
import {
  FileHashVerifierTool,
  TextHashGeneratorTool,
  TotpAuthenticatorTool,
  PrivacyMetadataCleanerTool,
} from './security/CryptoPrivacyTools';

interface SecurityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const SecurityWorkspace: React.FC<SecurityWorkspaceProps> = ({
  toolId,
  accentColor = '#0D9488',
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Shield className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'QR, Barcode & Security Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'QR codes, 1D barcodes, password generators, file integrity, and privacy utilities. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* 351-365: QR & BARCODE TOOLS */}
      {toolId === 351 && <QrGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 352 && <QrScannerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 361 && <BarcodeGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 362 && <BarcodeScannerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 363 && <QrCustomizerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 364 && <QrBatchGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 365 && <QrHistoryTool copied={copied} onCopy={handleCopyText} />}

      {/* 366-371: PASSWORD & PRIVACY TOOLS */}
      {toolId === 366 && <UrlSafetyCheckerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 367 && <PasswordStrengthTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 368 && <RandomPasswordTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 369 && <PassphraseGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 370 && <SecureNotesTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 371 && <SecretRedactorTool copied={copied} onCopy={handleCopyText} />}

      {/* 372-375: CRYPTO & INTEGRITY TOOLS */}
      {toolId === 372 && <FileHashVerifierTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 373 && <TextHashGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 374 && <TotpAuthenticatorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 375 && <PrivacyMetadataCleanerTool copied={copied} onCopy={handleCopyText} />}
    </div>
  );
};
