import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { QrCodeStudioPanel } from './security/QrCodeStudioPanel';
import { CodeScannerPanel } from './security/CodeScannerPanel';
import { BarcodeStudioPanel } from './security/BarcodeStudioPanel';
import { UrlSafetyPrivacyPanel } from './security/UrlSafetyPrivacyPanel';
import { PasswordSecurityPanel } from './security/PasswordSecurityPanel';
import { SecureNotesRedactorPanel } from './security/SecureNotesRedactorPanel';
import { CryptoIntegrityPanel } from './security/CryptoIntegrityPanel';
import { TotpAuthenticatorPanel } from './security/TotpAuthenticatorPanel';

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
          {currentToolDef?.description ||
            'Offline vector QR codes, 1D barcodes, cryptographic vaults, and privacy utilities. 100% Offline • Zero Server.'}
        </p>
      </div>

      {/* 351-365: QR & BARCODE TOOLS */}
      {toolId === 351 && <QrCodeStudioPanel defaultMode="url" copied={copied} onCopy={handleCopyText} />}
      {toolId === 352 && <CodeScannerPanel defaultMode="qr" copied={copied} onCopy={handleCopyText} />}
      {toolId === 353 && <QrCodeStudioPanel defaultMode="wifi" copied={copied} onCopy={handleCopyText} />}
      {toolId === 354 && <QrCodeStudioPanel defaultMode="contact" copied={copied} onCopy={handleCopyText} />}
      {toolId === 355 && <QrCodeStudioPanel defaultMode="url" copied={copied} onCopy={handleCopyText} />}
      {toolId === 356 && <QrCodeStudioPanel defaultMode="text" copied={copied} onCopy={handleCopyText} />}
      {toolId === 357 && <QrCodeStudioPanel defaultMode="email" copied={copied} onCopy={handleCopyText} />}
      {toolId === 358 && <QrCodeStudioPanel defaultMode="phone" copied={copied} onCopy={handleCopyText} />}
      {toolId === 359 && <QrCodeStudioPanel defaultMode="sms" copied={copied} onCopy={handleCopyText} />}
      {toolId === 360 && <QrCodeStudioPanel defaultMode="vcard" copied={copied} onCopy={handleCopyText} />}
      {toolId === 361 && <BarcodeStudioPanel copied={copied} onCopy={handleCopyText} />}
      {toolId === 362 && <CodeScannerPanel defaultMode="barcode" copied={copied} onCopy={handleCopyText} />}
      {toolId === 363 && <QrCodeStudioPanel defaultMode="custom" copied={copied} onCopy={handleCopyText} />}
      {toolId === 364 && <QrCodeStudioPanel defaultMode="batch" copied={copied} onCopy={handleCopyText} />}
      {toolId === 365 && <CodeScannerPanel defaultMode="history" copied={copied} onCopy={handleCopyText} />}

      {/* 366-371: PASSWORD & PRIVACY TOOLS */}
      {toolId === 366 && <UrlSafetyPrivacyPanel defaultMode="safety" copied={copied} onCopy={handleCopyText} />}
      {toolId === 367 && <PasswordSecurityPanel defaultMode="strength" copied={copied} onCopy={handleCopyText} />}
      {toolId === 368 && <PasswordSecurityPanel defaultMode="generator" copied={copied} onCopy={handleCopyText} />}
      {toolId === 369 && <PasswordSecurityPanel defaultMode="passphrase" copied={copied} onCopy={handleCopyText} />}
      {toolId === 370 && <SecureNotesRedactorPanel defaultMode="notes" copied={copied} onCopy={handleCopyText} />}
      {toolId === 371 && <SecureNotesRedactorPanel defaultMode="redactor" copied={copied} onCopy={handleCopyText} />}

      {/* 372-375: CRYPTO & INTEGRITY TOOLS */}
      {toolId === 372 && <CryptoIntegrityPanel defaultMode="file" copied={copied} onCopy={handleCopyText} />}
      {toolId === 373 && <CryptoIntegrityPanel defaultMode="text" copied={copied} onCopy={handleCopyText} />}
      {toolId === 374 && <TotpAuthenticatorPanel copied={copied} onCopy={handleCopyText} />}
      {toolId === 375 && <UrlSafetyPrivacyPanel defaultMode="cleaner" copied={copied} onCopy={handleCopyText} />}
    </div>
  );
};
