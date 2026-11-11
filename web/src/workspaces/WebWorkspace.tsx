import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import {
  UrlShortenerTool,
  UrlExpanderTool,
  WebsiteQrTool,
  LinkExtractorTool,
  UrlValidatorTool,
  QrLinkPreviewTool,
} from './web/UrlTools';
import {
  WebsiteMetadataViewerTool,
  HtmlPreviewerTool,
  OpenGraphPreviewTool,
  RobotsTxtViewerTool,
  SitemapViewerTool,
  MetaTagGeneratorTool,
  SitemapGeneratorTool,
  WebpageToMarkdownTool,
  WebsiteWordCounterTool,
} from './web/ContentSeoTools';
import {
  DnsLookupTool,
  PublicIpCheckerTool,
  IpInformationLookupTool,
  InternetSpeedTestTool,
  NetworkLatencyTool,
  HttpHeaderInspectorTool,
  SslCertificateCheckerTool,
  WebsiteAvailabilityTool,
} from './web/NetworkTools';
import {
  DataUriGeneratorTool,
  WebpageScreenshotTool,
} from './web/MediaDevTools';

interface WebWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const WebWorkspace: React.FC<WebWorkspaceProps> = ({
  toolId,
  accentColor = '#14B8A6',
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
            <Globe className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Web & Internet Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'URL shorteners, DNS lookups, SEO metadata, latency checkers, and web tools. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* 376-378, 392, 395, 397: URL & LINK TOOLS */}
      {toolId === 376 && <UrlShortenerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 377 && <UrlExpanderTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 378 && <WebsiteQrTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 392 && <LinkExtractorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 395 && <UrlValidatorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 397 && <QrLinkPreviewTool copied={copied} onCopy={handleCopyText} />}

      {/* 379-383, 393-394, 399-400: CONTENT & SEO TOOLS */}
      {toolId === 379 && <WebsiteMetadataViewerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 380 && <HtmlPreviewerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 381 && <OpenGraphPreviewTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 382 && <RobotsTxtViewerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 383 && <SitemapViewerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 393 && <MetaTagGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 394 && <SitemapGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 399 && <WebpageToMarkdownTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 400 && <WebsiteWordCounterTool copied={copied} onCopy={handleCopyText} />}

      {/* 384-391: NETWORK, DNS & SERVER TOOLS */}
      {toolId === 384 && <DnsLookupTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 385 && <PublicIpCheckerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 386 && <IpInformationLookupTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 387 && <InternetSpeedTestTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 388 && <NetworkLatencyTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 389 && <HttpHeaderInspectorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 390 && <SslCertificateCheckerTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 391 && <WebsiteAvailabilityTool copied={copied} onCopy={handleCopyText} />}

      {/* 396, 398: MEDIA & VIEWPORT TOOLS */}
      {toolId === 396 && <DataUriGeneratorTool copied={copied} onCopy={handleCopyText} />}
      {toolId === 398 && <WebpageScreenshotTool copied={copied} onCopy={handleCopyText} />}
    </div>
  );
};
