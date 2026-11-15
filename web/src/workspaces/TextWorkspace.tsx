import React from 'react';
import { Type } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { TextCountersPanel } from './text/TextCountersPanel';
import { CaseConverterPanel } from './text/CaseConverterPanel';
import { TextCleanerPanel } from './text/TextCleanerPanel';
import { TextDiffPanel } from './text/TextDiffPanel';
import { TextSplitMergePanel } from './text/TextSplitMergePanel';
import { TextExtractorsPanel } from './text/TextExtractorsPanel';
import { AsciiUnicodePanel } from './text/AsciiUnicodePanel';
import { TextCodecPanel } from './text/TextCodecPanel';
import { TextGeneratorsPanel } from './text/TextGeneratorsPanel';
import { WritingAssistantPanel } from './text/WritingAssistantPanel';
import { MarkdownToolsPanel } from './text/MarkdownToolsPanel';
import { DocumentTemplatesPanel } from './text/DocumentTemplatesPanel';

interface TextWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({
  toolId,
  accentColor = '#F97316',
}) => {
  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Type className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Text & Writing Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Offline word counters, readability metrics, case converters, line cleaners, diff checkers, and document formatters. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 205-209, 234, 237: WORD & TEXT COUNTERS & READABILITY    */}
      {/* ======================================================== */}
      {toolId === 205 && <TextCountersPanel focusedMetric="words" />}
      {toolId === 206 && <TextCountersPanel focusedMetric="characters" />}
      {toolId === 207 && <TextCountersPanel focusedMetric="sentences" />}
      {toolId === 208 && <TextCountersPanel focusedMetric="paragraphs" />}
      {toolId === 209 && <TextCountersPanel focusedMetric="time" />}
      {toolId === 234 && <TextCountersPanel focusedMetric="all" />}
      {toolId === 237 && <TextCountersPanel focusedMetric="readability" />}

      {/* ======================================================== */}
      {/* 210, 221, 222: CASE CONVERTER & URL SLUGS                */}
      {/* ======================================================== */}
      {toolId === 210 && <CaseConverterPanel defaultMode="all" />}
      {toolId === 221 && <CaseConverterPanel defaultMode="slug" />}
      {toolId === 222 && <CaseConverterPanel defaultMode="slug" />}

      {/* ======================================================== */}
      {/* 211-216, 220: TEXT CLEANER & LINE OPERATIONS             */}
      {/* ======================================================== */}
      {toolId === 211 && <TextCleanerPanel defaultSubTool="spaces" />}
      {toolId === 212 && <TextCleanerPanel defaultSubTool="empty" />}
      {toolId === 213 && <TextCleanerPanel defaultSubTool="duplicates" />}
      {toolId === 214 && <TextCleanerPanel defaultSubTool="sort" />}
      {toolId === 215 && <TextCleanerPanel defaultSubTool="reverse" />}
      {toolId === 216 && <TextCleanerPanel defaultSubTool="find-replace" />}
      {toolId === 220 && <TextCleanerPanel defaultSubTool="repeater" />}

      {/* ======================================================== */}
      {/* 217: TEXT DIFF CHECKER                                   */}
      {/* ======================================================== */}
      {toolId === 217 && <TextDiffPanel />}

      {/* ======================================================== */}
      {/* 218, 219: TEXT SPLITTER & TEXT MERGER                    */}
      {/* ======================================================== */}
      {toolId === 218 && <TextSplitMergePanel initialMode="split" />}
      {toolId === 219 && <TextSplitMergePanel initialMode="merge" />}

      {/* ======================================================== */}
      {/* 223, 224, 225: ENTITY EXTRACTORS (URL, EMAIL, PHONE)     */}
      {/* ======================================================== */}
      {toolId === 223 && <TextExtractorsPanel defaultCategory="urls" />}
      {toolId === 224 && <TextExtractorsPanel defaultCategory="emails" />}
      {toolId === 225 && <TextExtractorsPanel defaultCategory="phones" />}

      {/* ======================================================== */}
      {/* 226, 227, 228: ASCII & UNICODE INSPECTOR                 */}
      {/* ======================================================== */}
      {toolId === 226 && <AsciiUnicodePanel defaultMode="text-to-ascii" />}
      {toolId === 227 && <AsciiUnicodePanel defaultMode="ascii-to-text" />}
      {toolId === 228 && <AsciiUnicodePanel defaultMode="unicode" />}

      {/* ======================================================== */}
      {/* 229, 230: TEXT ENCODER & DECODER                         */}
      {/* ======================================================== */}
      {toolId === 229 && <TextCodecPanel initialMode="encode" />}
      {toolId === 230 && <TextCodecPanel initialMode="decode" />}

      {/* ======================================================== */}
      {/* 231, 232, 233: LOREM IPSUM & SAMPLE DATA GENERATORS      */}
      {/* ======================================================== */}
      {toolId === 231 && <TextGeneratorsPanel defaultTool="lorem" />}
      {toolId === 232 && <TextGeneratorsPanel defaultTool="random-text" />}
      {toolId === 233 && <TextGeneratorsPanel defaultTool="names" />}

      {/* ======================================================== */}
      {/* 235, 236, 242: GRAMMAR, SPELL CHECK & EMAIL ASSISTANT    */}
      {/* ======================================================== */}
      {toolId === 235 && <WritingAssistantPanel defaultSubTool="grammar" />}
      {toolId === 236 && <WritingAssistantPanel defaultSubTool="spell" />}
      {toolId === 242 && <WritingAssistantPanel defaultSubTool="email" />}

      {/* ======================================================== */}
      {/* 238, 239: MARKDOWN EDITOR & TABLE GENERATOR              */}
      {/* ======================================================== */}
      {toolId === 238 && <MarkdownToolsPanel defaultSubTool="editor" />}
      {toolId === 239 && <MarkdownToolsPanel defaultSubTool="table" />}

      {/* ======================================================== */}
      {/* 240, 241, 243: DOCUMENT TEMPLATES & BENGALI HELPER       */}
      {/* ======================================================== */}
      {toolId === 240 && <DocumentTemplatesPanel defaultSubTool="meeting" />}
      {toolId === 241 && <DocumentTemplatesPanel defaultSubTool="resume" />}
      {toolId === 243 && <DocumentTemplatesPanel defaultSubTool="bengali" />}
    </div>
  );
};
