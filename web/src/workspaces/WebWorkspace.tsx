import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { UrlToolsPanel } from './web/UrlToolsPanel';
import { ContentSeoPanel } from './web/ContentSeoPanel';
import { NetworkServerPanel } from './web/NetworkServerPanel';
import { MediaDevPanel } from './web/MediaDevPanel';

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
          {currentToolDef?.description ||
            'Offline URL tools, DNS over HTTPS, SEO meta tags, latency diagnostics, and web utilities. 100% Offline • Zero Server.'}
        </p>
      </div>

      {/* 376-378, 392, 395, 397: URL & LINK TOOLS */}
      {toolId === 376 && <UrlToolsPanel defaultMode="shortener" copied={copied} onCopy={handleCopyText} />}
      {toolId === 377 && <UrlToolsPanel defaultMode="expander" copied={copied} onCopy={handleCopyText} />}
      {toolId === 378 && <UrlToolsPanel defaultMode="qr" copied={copied} onCopy={handleCopyText} />}
      {toolId === 392 && <UrlToolsPanel defaultMode="extractor" copied={copied} onCopy={handleCopyText} />}
      {toolId === 395 && <UrlToolsPanel defaultMode="validator" copied={copied} onCopy={handleCopyText} />}
      {toolId === 397 && <UrlToolsPanel defaultMode="preview" copied={copied} onCopy={handleCopyText} />}

      {/* 379-383, 393-394, 399-400: CONTENT & SEO TOOLS */}
      {toolId === 379 && <ContentSeoPanel defaultMode="metadata" copied={copied} onCopy={handleCopyText} />}
      {toolId === 380 && <ContentSeoPanel defaultMode="previewer" copied={copied} onCopy={handleCopyText} />}
      {toolId === 381 && <ContentSeoPanel defaultMode="opengraph" copied={copied} onCopy={handleCopyText} />}
      {toolId === 382 && <ContentSeoPanel defaultMode="robotstxt" copied={copied} onCopy={handleCopyText} />}
      {toolId === 383 && <ContentSeoPanel defaultMode="sitemap_viewer" copied={copied} onCopy={handleCopyText} />}
      {toolId === 393 && <ContentSeoPanel defaultMode="metatags" copied={copied} onCopy={handleCopyText} />}
      {toolId === 394 && <ContentSeoPanel defaultMode="sitemap_gen" copied={copied} onCopy={handleCopyText} />}
      {toolId === 399 && <ContentSeoPanel defaultMode="markdown" copied={copied} onCopy={handleCopyText} />}
      {toolId === 400 && <ContentSeoPanel defaultMode="wordcount" copied={copied} onCopy={handleCopyText} />}

      {/* 384-391: NETWORK, DNS & SERVER TOOLS */}
      {toolId === 384 && <NetworkServerPanel defaultMode="dns" copied={copied} onCopy={handleCopyText} />}
      {toolId === 385 && <NetworkServerPanel defaultMode="myip" copied={copied} onCopy={handleCopyText} />}
      {toolId === 386 && <NetworkServerPanel defaultMode="subnet" copied={copied} onCopy={handleCopyText} />}
      {toolId === 387 && <NetworkServerPanel defaultMode="speed" copied={copied} onCopy={handleCopyText} />}
      {toolId === 388 && <NetworkServerPanel defaultMode="latency" copied={copied} onCopy={handleCopyText} />}
      {toolId === 389 && <NetworkServerPanel defaultMode="headers" copied={copied} onCopy={handleCopyText} />}
      {toolId === 390 && <NetworkServerPanel defaultMode="ssl" copied={copied} onCopy={handleCopyText} />}
      {toolId === 391 && <NetworkServerPanel defaultMode="availability" copied={copied} onCopy={handleCopyText} />}

      {/* 396, 398: MEDIA & DEV TOOLS */}
      {toolId === 396 && <MediaDevPanel defaultMode="datauri" copied={copied} onCopy={handleCopyText} />}
      {toolId === 398 && <MediaDevPanel defaultMode="screenshot" copied={copied} onCopy={handleCopyText} />}
    </div>
  );
};
