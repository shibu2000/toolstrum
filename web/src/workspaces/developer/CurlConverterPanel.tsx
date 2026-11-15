import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Code,
  Layers,
} from 'lucide-react';

const SAMPLE_CURL = `curl -X POST "https://api.toolstrum.app/v1/workspaces" \\
  -H "Authorization: Bearer sec_tok_991823" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"name":"Local Project","offline":true,"version":2}'`;

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: string;
}

export function parseCurlCommand(raw: string): ParsedCurl {
  const clean = raw.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();

  // Extract URL
  const urlMatch = clean.match(/(?:curl\s+)?(?:-X\s+[A-Z]+\s+)?["']?(https?:\/\/[^\s"']+)["']?/i);
  const url = urlMatch ? urlMatch[1] : 'https://api.example.com/v1';

  // Extract Method
  let method = 'GET';
  const methodMatch = clean.match(/-X\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  } else if (clean.includes('-d ') || clean.includes('--data ') || clean.includes('--data-raw ')) {
    method = 'POST';
  }

  // Extract Headers
  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
  let match;
  while ((match = headerRegex.exec(clean)) !== null) {
    const parts = match[1].split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      headers[key] = val;
    }
  }

  // Extract Data / Body
  let data: string | undefined = undefined;
  const dataMatch = clean.match(/(?:-d|--data|--data-raw)\s+['"]([\s\S]*?)['"](?=\s+-[a-zA-Z]|$)/);
  if (dataMatch) {
    data = dataMatch[1];
  }

  return { method, url, headers, data };
}

export const CurlConverterPanel: React.FC = () => {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [targetLang, setTargetLang] = useState<'fetch' | 'axios' | 'python' | 'go' | 'rust'>('fetch');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const parsed: ParsedCurl = useMemo(() => {
    return parseCurlCommand(curlInput);
  }, [curlInput]);

  // Generate target code
  const generatedCode = useMemo(() => {
    const { method, url, headers, data } = parsed;
    const hasBody = method !== 'GET' && method !== 'HEAD' && !!data;

    switch (targetLang) {
      case 'fetch': {
        const headerStr = Object.keys(headers).length
          ? JSON.stringify(headers, null, 4).replace(/^/gm, '  ')
          : '  {}';
        return `// JavaScript (Native Fetch API)\nconst response = await fetch("${url}", {\n  method: "${method}",\n  headers: ${headerStr.trim()},\n${
          hasBody ? `  body: JSON.stringify(${data}),\n` : ''
        }});\n\nconst data = await response.json();\nconsole.log(data);`;
      }

      case 'axios': {
        const headerStr = Object.keys(headers).length
          ? JSON.stringify(headers, null, 4).replace(/^/gm, '  ')
          : '  {}';
        return `// JavaScript (Axios)\nimport axios from 'axios';\n\nconst response = await axios({\n  method: "${method.toLowerCase()}",\n  url: "${url}",\n  headers: ${headerStr.trim()},\n${
          hasBody ? `  data: ${data},\n` : ''
        }});\n\nconsole.log(response.data);`;
      }

      case 'python': {
        const headerStr = Object.keys(headers).length
          ? JSON.stringify(headers, null, 4)
          : '{}';
        return `# Python (requests)\nimport requests\nimport json\n\nurl = "${url}"\nheaders = ${headerStr}\n${
          hasBody ? `payload = ${data}\n\nresponse = requests.${method.toLowerCase()}(url, headers=headers, json=payload)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`
        }\n\nprint(response.status_code)\nprint(response.json())`;
      }

      case 'go': {
        return `// Go (net/http)\npackage main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io"\n\t"strings"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\t${
          hasBody
            ? `body := strings.NewReader(\`${data}\`)\n\treq, err := http.NewRequest("${method}", "${url}", body)`
            : `req, err := http.NewRequest("${method}", "${url}", nil)`
        }\n\tif err != nil {\n\t\tpanic(err)\n\t}\n${Object.entries(headers)
          .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
          .join('\n')}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\trespBody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(respBody))\n}`;
      }

      case 'rust': {
        return `// Rust (reqwest)\nuse reqwest::header::HeaderMap;\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let client = reqwest::Client::new();\n    let mut headers = HeaderMap::new();\n${Object.entries(
          headers
        )
          .map(
            ([k, v]) =>
              `    headers.insert("${k}", "${v}".parse().unwrap());`
          )
          .join('\n')}\n\n    let resp = client\n        .${method.toLowerCase()}("${url}")\n        .headers(headers)\n${
          hasBody ? `        .body(r#"${data}"#)\n` : ''
        }        .send()\n        .await?;\n\n    println!("{:#?}", resp.text().await?);\n    Ok(())\n}`;
      }

      default:
        return '';
    }
  }, [parsed, targetLang]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              cURL to Fetch, Axios, Python & Go Converter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instantly converts bash cURL commands into idiomatic programming language snippets.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurlInput(SAMPLE_CURL)}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sample</span>
        </button>
      </div>

      {/* Editor & Converted Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: cURL Command Input */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
            Paste cURL Command
          </label>
          <textarea
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            rows={14}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="curl -X GET https://api.example.com..."
          />

          {/* Parsed Telemetry Breakdown */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Detected Method:</span>
              <strong className="font-mono text-sky-600 dark:text-sky-400">{parsed.method}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Detected Headers:</span>
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {Object.keys(parsed.headers).length} headers
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payload Detected:</span>
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {parsed.data ? 'Yes (Payload Attached)' : 'None'}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: Converted Snippet Output */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {(['fetch', 'axios', 'python', 'go', 'rust'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTargetLang(lang)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition-all ${
                    targetLang === lang
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => copyToClipboard(generatedCode, 'code')}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              {copiedKey === 'code' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>Copy Code</span>
            </button>
          </div>

          <div className="h-[400px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <pre className="p-4 h-full font-mono text-xs text-sky-600 dark:text-sky-400 whitespace-pre-wrap overflow-y-auto">
              {generatedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
