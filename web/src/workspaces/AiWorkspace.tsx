import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { AiAssistantRouterPanel } from './ai/AiAssistantRouterPanel';
import { AiDocsAnalysisPanel } from './ai/AiDocsAnalysisPanel';
import { AiWritingSummarizerPanel } from './ai/AiWritingSummarizerPanel';
import { AiVisionCodeTranslatorPanel } from './ai/AiVisionCodeTranslatorPanel';

interface AiWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AiWorkspace: React.FC<AiWorkspaceProps> = ({
  toolId,
  accentColor = '#A855F7',
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
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'AI Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'On-device AI assistants, semantic document analysis, natural language routing, and offline intelligence. 100% Offline • Zero Server.'}
        </p>
      </div>

      {/* 401, 414: AI Smart Tool Router & Assistant */}
      {toolId === 401 && <AiAssistantRouterPanel copied={copied} onCopy={handleCopyText} />}
      {toolId === 414 && <AiAssistantRouterPanel copied={copied} onCopy={handleCopyText} />}

      {/* 402, 403, 415, 416: Document & PDF Intelligence */}
      {toolId === 402 && <AiDocsAnalysisPanel defaultMode="pdf_assistant" copied={copied} onCopy={handleCopyText} />}
      {toolId === 403 && <AiDocsAnalysisPanel defaultMode="extractor" copied={copied} onCopy={handleCopyText} />}
      {toolId === 415 && <AiDocsAnalysisPanel defaultMode="comparison" copied={copied} onCopy={handleCopyText} />}
      {toolId === 416 && <AiDocsAnalysisPanel defaultMode="analyst" copied={copied} onCopy={handleCopyText} />}

      {/* 404, 409, 411, 412, 413: Writing, Resume & Summarization */}
      {toolId === 404 && <AiWritingSummarizerPanel defaultMode="writing" copied={copied} onCopy={handleCopyText} />}
      {toolId === 409 && <AiWritingSummarizerPanel defaultMode="resume" copied={copied} onCopy={handleCopyText} />}
      {toolId === 411 && <AiWritingSummarizerPanel defaultMode="email" copied={copied} onCopy={handleCopyText} />}
      {toolId === 412 && <AiWritingSummarizerPanel defaultMode="meeting" copied={copied} onCopy={handleCopyText} />}
      {toolId === 413 && <AiWritingSummarizerPanel defaultMode="study" copied={copied} onCopy={handleCopyText} />}

      {/* 405, 406, 407, 408, 410: Vision, Code, Voice & Translation */}
      {toolId === 405 && <AiVisionCodeTranslatorPanel defaultMode="image" copied={copied} onCopy={handleCopyText} />}
      {toolId === 406 && <AiVisionCodeTranslatorPanel defaultMode="translator" copied={copied} onCopy={handleCopyText} />}
      {toolId === 407 && <AiVisionCodeTranslatorPanel defaultMode="voice" copied={copied} onCopy={handleCopyText} />}
      {toolId === 408 && <AiVisionCodeTranslatorPanel defaultMode="ocr" copied={copied} onCopy={handleCopyText} />}
      {toolId === 410 && <AiVisionCodeTranslatorPanel defaultMode="code" copied={copied} onCopy={handleCopyText} />}
    </div>
  );
};
