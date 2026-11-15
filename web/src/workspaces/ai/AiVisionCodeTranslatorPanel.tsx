import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Languages,
  Mic,
  FileScan,
  Code2,
  Copy,
  Check,
  Upload,
  Sparkles,
  Play,
  Terminal,
} from 'lucide-react';
import {
  explainCodeSnippet,
  translatePhrase,
  parseVoiceCommand,
  CodeAnalysis,
  VoiceActionParsed,
} from './aiHelpers';

interface AiVisionCodeTranslatorPanelProps {
  defaultMode?: 'image' | 'translator' | 'voice' | 'ocr' | 'code';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const AiVisionCodeTranslatorPanel: React.FC<AiVisionCodeTranslatorPanelProps> = ({
  defaultMode = 'code',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'translator' | 'voice' | 'ocr' | 'code'>(
    defaultMode
  );

  // 405: Image Assistant
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number; aspect: string } | null>(null);
  const [imgDataUrl, setImgDataUrl] = useState<string>('');
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImgDataUrl(src);
      const img = new Image();
      img.onload = () => {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.width, img.height);
        const aspect = `${img.width / divisor}:${img.height / divisor}`;
        setImgDimensions({ width: img.width, height: img.height, aspect });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // 406: Translator
  const [transInput, setTransInput] = useState('hello, how are you? welcome to our offline app');
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'de' | 'hi'>('es');
  const translatedText = translatePhrase(transInput, targetLang);

  // 407: Voice Assistant
  const [voiceQuery, setVoiceQuery] = useState('Please merge these three PDF documents and compress them');
  const [parsedVoice, setParsedVoice] = useState<VoiceActionParsed>(() => parseVoiceCommand(voiceQuery));

  useEffect(() => {
    setParsedVoice(parseVoiceCommand(voiceQuery));
  }, [voiceQuery]);

  // 408: OCR Image to Text
  const [ocrText, setOcrText] = useState('INVOICE #9201\nTotal Amount: $250.00\nPayment Status: PAID\nDate: 2026-11-15');
  const [ocrUploaded, setOcrUploaded] = useState(false);

  // 410: Code Assistant
  const [codeSnippet, setCodeSnippet] = useState(
    `function calculateSum(numbers: number[]): number {\n  let total = 0;\n  for (const n of numbers) {\n    total += n;\n  }\n  return total;\n}`
  );
  const [codeLanguage, setCodeLanguage] = useState('TypeScript');
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis>(() =>
    explainCodeSnippet(codeSnippet, codeLanguage)
  );

  useEffect(() => {
    setCodeAnalysis(explainCodeSnippet(codeSnippet, codeLanguage));
  }, [codeSnippet, codeLanguage]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'image', label: 'Image Assistant (#405)', icon: ImageIcon },
          { id: 'translator', label: 'Offline Translator (#406)', icon: Languages },
          { id: 'voice', label: 'Voice Action Parser (#407)', icon: Mic },
          { id: 'ocr', label: 'Image to Text (#408)', icon: FileScan },
          { id: 'code', label: 'Code Assistant (#410)', icon: Code2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 405: Image Assistant */}
      {activeTab === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Image to Analyze</h3>
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
              <ImageIcon className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400" />
              <input type="file" accept="image/*" ref={imgInputRef} onChange={handleImageUpload} className="hidden" />
              <button
                onClick={() => imgInputRef.current?.click()}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Select Image
              </button>
            </div>
            {imgDataUrl && (
              <img src={imgDataUrl} alt="Preview" className="max-h-56 mx-auto rounded-2xl object-contain shadow-xs" />
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Visual Intelligence Report
            </span>

            {imgDimensions ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {imgDimensions.width} × {imgDimensions.height} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aspect Ratio:</span>
                  <span className="font-mono font-bold text-purple-600">{imgDimensions.aspect}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Megapixels:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {((imgDimensions.width * imgDimensions.height) / 1000000).toFixed(2)} MP
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">
                Select an image to compute dimensions, aspect ratio, and composition metrics.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 406: Translator */}
      {activeTab === 'translator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">English Phrase to Translate</h3>
            <textarea
              value={transInput}
              onChange={(e) => setTransInput(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs leading-relaxed"
            />
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Target Language</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'es', label: 'Spanish' },
                  { id: 'fr', label: 'French' },
                  { id: 'de', label: 'German' },
                  { id: 'hi', label: 'Hindi' },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setTargetLang(lang.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      targetLang === lang.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Offline Translation Output
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(translatedText)}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <p className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              {translatedText}
            </p>
          </div>
        </div>
      )}

      {/* 407: Voice Command Parser */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spoken Command Transcript</h3>
            <textarea
              value={voiceQuery}
              onChange={(e) => setVoiceQuery(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Parsed Intent & Action
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Action Code:</span>
                <span className="font-mono font-bold text-purple-600">{parsedVoice.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{parsedVoice.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Object:</span>
                <span className="font-bold text-slate-900 dark:text-white">{parsedVoice.targetObject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Score:</span>
                <span className="font-mono font-bold text-emerald-500">{parsedVoice.confidence}%</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                {parsedVoice.interpretedCommand}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 408: Image to Text (OCR) */}
      {activeTab === 'ocr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document or Receipt Image</h3>
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <FileScan className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400" />
              <button
                onClick={() => setOcrUploaded(true)}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Scan Image Locally
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Optical Character Recognition (OCR) Output
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(ocrText)}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed text-slate-900 dark:text-white">
              {ocrText}
            </pre>
          </div>
        </div>
      )}

      {/* 410: Code Assistant */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Code Snippet</h3>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Rust">Rust</option>
              </select>
            </div>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Code Analysis & Complexity
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Complexity:</span>
                <span className="font-mono font-bold text-purple-600">{codeAnalysis.complexity}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{codeAnalysis.summary}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Recommendations:</span>
                {codeAnalysis.recommendations.map((rec, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-300">• {rec}</p>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Generated Docstring:</span>
                <pre className="p-2.5 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] text-teal-600 dark:text-teal-400">
                  {codeAnalysis.docstring}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
