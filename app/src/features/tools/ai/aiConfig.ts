export type AiWorkspaceId =
  | 'ai_assistant_router'
  | 'ai_docs_analysis'
  | 'ai_writing_summarizer'
  | 'ai_vision_code_translator';

export interface AiToolConfig {
  id: number;
  workspaceId: AiWorkspaceId;
  title: string;
  subtitle: string;
  mode: string;
  description: string;
  iconName: string;
}

export const AI_TOOLS_CONFIG: Record<number, AiToolConfig> = {
  // --- Workspace 1: ai_assistant_router (4 tools) ---
  401: {
    id: 401,
    workspaceId: 'ai_assistant_router',
    title: 'AI Utility Assistant',
    subtitle: 'AI Studio Utilities',
    mode: 'assistant_general',
    description: 'Ask questions, dispatch commands, and find the right local tool for any workflow.',
    iconName: 'Bot',
  },
  407: {
    id: 407,
    workspaceId: 'ai_assistant_router',
    title: 'AI Voice Assistant',
    subtitle: 'AI Studio Utilities',
    mode: 'assistant_voice',
    description: 'Parse natural voice commands into immediate offline actions and tool executions.',
    iconName: 'Mic',
  },
  413: {
    id: 413,
    workspaceId: 'ai_assistant_router',
    title: 'AI Study Assistant',
    subtitle: 'AI Studio Utilities',
    mode: 'study_flashcards',
    description: 'Generate study flashcards, active recall quizzes, and simplified conceptual summaries.',
    iconName: 'GraduationCap',
  },
  414: {
    id: 414,
    workspaceId: 'ai_assistant_router',
    title: 'AI Smart Tool Router',
    subtitle: 'AI Studio Utilities',
    mode: 'tool_router',
    description: 'Natural language search engine routing your prompt to the exact tool among all 500.',
    iconName: 'Compass',
  },

  // --- Workspace 2: ai_docs_analysis (4 tools) ---
  402: {
    id: 402,
    workspaceId: 'ai_docs_analysis',
    title: 'AI PDF Assistant',
    subtitle: 'Document Intelligence',
    mode: 'pdf_assistant',
    description: 'Summarize PDF contents, outline section hierarchy, and extract key action takeaways.',
    iconName: 'FileText',
  },
  403: {
    id: 403,
    workspaceId: 'ai_docs_analysis',
    title: 'AI Document Extractor',
    subtitle: 'Document Intelligence',
    mode: 'doc_extractor',
    description: 'Detect and extract named entities, dates, currencies, organizations, and emails.',
    iconName: 'ScanText',
  },
  415: {
    id: 415,
    workspaceId: 'ai_docs_analysis',
    title: 'AI Document Comparison',
    subtitle: 'Document Intelligence',
    mode: 'doc_comparison',
    description: 'Analyze semantic document differences, clause modifications, and textual drift.',
    iconName: 'FileDiff',
  },
  416: {
    id: 416,
    workspaceId: 'ai_docs_analysis',
    title: 'AI Data Analyst',
    subtitle: 'Document Intelligence',
    mode: 'data_analyst',
    description: 'Compute statistical distribution, trend trajectories, and anomaly detection from raw data.',
    iconName: 'BarChart2',
  },

  // --- Workspace 3: ai_writing_summarizer (4 tools) ---
  404: {
    id: 404,
    workspaceId: 'ai_writing_summarizer',
    title: 'AI Writing Assistant',
    subtitle: 'Writing & Summarization',
    mode: 'writing_assist',
    description: 'Rewrite, polish tone, fix passive voice, and improve readability with offline heuristics.',
    iconName: 'PenTool',
  },
  409: {
    id: 409,
    workspaceId: 'ai_writing_summarizer',
    title: 'AI Resume Builder',
    subtitle: 'Writing & Summarization',
    mode: 'resume_builder',
    description: 'Format high-impact resume experience bullets using strong active leadership verbs.',
    iconName: 'Briefcase',
  },
  411: {
    id: 411,
    workspaceId: 'ai_writing_summarizer',
    title: 'AI Email Assistant',
    subtitle: 'Writing & Summarization',
    mode: 'email_assistant',
    description: 'Compose polished business emails with greeting, value proposition, and clear call-to-action.',
    iconName: 'Mail',
  },
  412: {
    id: 412,
    workspaceId: 'ai_writing_summarizer',
    title: 'AI Meeting Summarizer',
    subtitle: 'Writing & Summarization',
    mode: 'meeting_summarizer',
    description: 'Parse raw meeting transcripts into agenda items, decisions made, and assigned tasks.',
    iconName: 'Users',
  },

  // --- Workspace 4: ai_vision_code_translator (4 tools) ---
  405: {
    id: 405,
    workspaceId: 'ai_vision_code_translator',
    title: 'AI Image Assistant',
    subtitle: 'Vision, Code & Translation',
    mode: 'image_assistant',
    description: 'Generate descriptive image captions, alt text, and diffusion prompt enhancements.',
    iconName: 'Image',
  },
  406: {
    id: 406,
    workspaceId: 'ai_vision_code_translator',
    title: 'AI Translator',
    subtitle: 'Vision, Code & Translation',
    mode: 'translator',
    description: 'Translate common phrases and idioms between English, Spanish, French, German, and Hindi.',
    iconName: 'Languages',
  },
  408: {
    id: 408,
    workspaceId: 'ai_vision_code_translator',
    title: 'AI Image-to-Text',
    subtitle: 'Vision, Code & Translation',
    mode: 'image_to_text',
    description: 'Extract and format text layout blocks from image receipts, labels, and screenshots.',
    iconName: 'FileSpreadsheet',
  },
  410: {
    id: 410,
    workspaceId: 'ai_vision_code_translator',
    title: 'AI Code Assistant',
    subtitle: 'Vision, Code & Translation',
    mode: 'code_assistant',
    description: 'Explain algorithmic logic, detect code smell antipatterns, and generate docstrings.',
    iconName: 'Code',
  },
};

export function getAiToolConfig(toolId: number): AiToolConfig | undefined {
  return AI_TOOLS_CONFIG[toolId];
}
