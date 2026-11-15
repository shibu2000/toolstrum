import React from 'react';
import { Code } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { JsonFormatterPanel } from './developer/JsonFormatterPanel';
import { JsonValidatorPanel } from './developer/JsonValidatorPanel';
import { JsonMinifierPanel } from './developer/JsonMinifierPanel';
import { JsonDiffPanel } from './developer/JsonDiffPanel';
import { JsonPathPanel } from './developer/JsonPathPanel';
import { JsonToTypePanel } from './developer/JsonToTypePanel';
import { JsonSchemaGeneratorPanel } from './developer/JsonSchemaGeneratorPanel';
import { YamlFormatterPanel } from './developer/YamlFormatterPanel';
import { YamlValidatorPanel } from './developer/YamlValidatorPanel';
import { YamlJsonConverterPanel } from './developer/YamlJsonConverterPanel';
import { XmlValidatorFormatterPanel } from './developer/XmlValidatorFormatterPanel';
import { HtmlFormatterPanel } from './developer/HtmlFormatterPanel';
import { HtmlMinifierPanel } from './developer/HtmlMinifierPanel';
import { CssFormatterPanel } from './developer/CssFormatterPanel';
import { CssMinifierPanel } from './developer/CssMinifierPanel';
import { JsFormatterPanel } from './developer/JsFormatterPanel';
import { JsMinifierPanel } from './developer/JsMinifierPanel';
import { SqlFormatterPanel } from './developer/SqlFormatterPanel';
import { SqlMinifierPanel } from './developer/SqlMinifierPanel';
import { SqlQueryExplainerPanel } from './developer/SqlQueryExplainerPanel';
import { RegexTesterPanel } from './developer/RegexTesterPanel';
import { RegexExplainerPanel } from './developer/RegexExplainerPanel';
import { Base64CodecPanel } from './developer/Base64CodecPanel';
import { UrlCodecPanel } from './developer/UrlCodecPanel';
import { HtmlEntityCodecPanel } from './developer/HtmlEntityCodecPanel';
import { JwtInspectorPanel } from './developer/JwtInspectorPanel';
import { UuidGeneratorPanel } from './developer/UuidGeneratorPanel';
import { UlidGeneratorPanel } from './developer/UlidGeneratorPanel';
import { HashGeneratorPanel } from './developer/HashGeneratorPanel';
import { HmacGeneratorPanel } from './developer/HmacGeneratorPanel';
import { PasswordGeneratorPanel } from './developer/PasswordGeneratorPanel';
import { BcryptInspectorPanel } from './developer/BcryptInspectorPanel';
import { ColorConverterPanel } from './developer/ColorConverterPanel';
import { GradientGeneratorPanel } from './developer/GradientGeneratorPanel';
import { BoxShadowGeneratorPanel } from './developer/BoxShadowGeneratorPanel';
import { BorderRadiusGeneratorPanel } from './developer/BorderRadiusGeneratorPanel';
import { FlexboxPlaygroundPanel } from './developer/FlexboxPlaygroundPanel';
import { GridGeneratorPanel } from './developer/GridGeneratorPanel';
import { UnixTimestampPanel } from './developer/UnixTimestampPanel';
import { CrontabHelperPanel } from './developer/CrontabHelperPanel';
import { DiffPatchPanel } from './developer/DiffPatchPanel';
import { UrlParserPanel } from './developer/UrlParserPanel';
import { UserAgentParserPanel } from './developer/UserAgentParserPanel';
import { HttpStatusCodePanel } from './developer/HttpStatusCodePanel';
import { MimeTypePanel } from './developer/MimeTypePanel';
import { MarkdownFormatterPanel } from './developer/MarkdownFormatterPanel';
import { SqlInsertGeneratorPanel } from './developer/SqlInsertGeneratorPanel';
import { MockJsonGeneratorPanel } from './developer/MockJsonGeneratorPanel';
import { ApiRequestBuilderPanel } from './developer/ApiRequestBuilderPanel';
import { CurlConverterPanel } from './developer/CurlConverterPanel';
import { QrPayloadInspectorPanel } from './developer/QrPayloadInspectorPanel';
import { CertificateInspectorPanel } from './developer/CertificateInspectorPanel';
import { IpSubnetCalculatorPanel } from './developer/IpSubnetCalculatorPanel';

interface DeveloperWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const DeveloperWorkspace: React.FC<DeveloperWorkspaceProps> = ({
  toolId,
  accentColor = '#0EA5E9',
}) => {
  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Code className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Developer Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Format, encode, decode, test regex, inspect JWTs, and generate styles. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* 244 — JSON FORMATTER (BEAUTIFY & TREE) — dedicated modern panel */}
      {toolId === 244 && <JsonFormatterPanel />}

      {/* 245 — JSON VALIDATOR & SCHEMA LINTER — dedicated modern panel */}
      {toolId === 245 && <JsonValidatorPanel />}

      {/* 246 — JSON MINIFIER & COMPRESSION CRUNCHER — dedicated modern panel */}
      {toolId === 246 && <JsonMinifierPanel />}

      {/* 247 — JSON DIFF & OBJECT COMPARISON — dedicated modern panel */}
      {toolId === 247 && <JsonDiffPanel />}

      {/* 248 — JSONPATH EVALUATOR & NODE EXTRACTOR — dedicated modern panel */}
      {toolId === 248 && <JsonPathPanel />}

      {/* 249 — JSON TO TYPESCRIPT / GO / RUST / PYTHON — dedicated modern panel */}
      {toolId === 249 && <JsonToTypePanel />}

      {/* 250 — JSON TO JSON SCHEMA CONVERTER — dedicated modern panel */}
      {toolId === 250 && <JsonSchemaGeneratorPanel />}

      {/* ======================================================== */}
      {/* 251-264: DEDICATED CODE & FORMATTER TOOLS */}
      {/* ======================================================== */}
      {toolId === 251 && <YamlFormatterPanel />}
      {toolId === 252 && <YamlValidatorPanel />}
      {toolId === 253 && <YamlJsonConverterPanel initialDirection="yaml-to-json" />}
      {toolId === 254 && <YamlJsonConverterPanel initialDirection="json-to-yaml" />}
      {toolId === 255 && <XmlValidatorFormatterPanel />}
      {toolId === 256 && <HtmlFormatterPanel />}
      {toolId === 257 && <HtmlMinifierPanel />}
      {toolId === 258 && <CssFormatterPanel />}
      {toolId === 259 && <CssMinifierPanel />}
      {toolId === 260 && <JsFormatterPanel />}
      {toolId === 261 && <JsMinifierPanel />}
      {toolId === 262 && <SqlFormatterPanel />}
      {toolId === 263 && <SqlMinifierPanel />}
      {toolId === 264 && <SqlQueryExplainerPanel />}

      {/* ======================================================== */}
      {/* 265-266: DEDICATED REGEX TOOLS */}
      {/* ======================================================== */}
      {toolId === 265 && <RegexTesterPanel />}
      {toolId === 266 && <RegexExplainerPanel />}

      {/* ======================================================== */}
      {/* 267-272: DEDICATED CODEC TOOLS */}
      {/* ======================================================== */}
      {toolId === 267 && <Base64CodecPanel initialDirection="encode" />}
      {toolId === 268 && <Base64CodecPanel initialDirection="decode" />}
      {toolId === 269 && <UrlCodecPanel initialDirection="encode" />}
      {toolId === 270 && <UrlCodecPanel initialDirection="decode" />}
      {toolId === 271 && <HtmlEntityCodecPanel initialDirection="encode" />}
      {toolId === 272 && <HtmlEntityCodecPanel initialDirection="decode" />}

      {/* ======================================================== */}
      {/* 273-279: DEDICATED SECURITY & CRYPTO TOOLS */}
      {/* ======================================================== */}
      {toolId === 273 && <JwtInspectorPanel />}
      {toolId === 274 && <UuidGeneratorPanel />}
      {toolId === 275 && <UlidGeneratorPanel />}
      {toolId === 276 && <HashGeneratorPanel />}
      {toolId === 277 && <HmacGeneratorPanel />}
      {toolId === 278 && <PasswordGeneratorPanel />}
      {toolId === 279 && <BcryptInspectorPanel />}

      {/* ======================================================== */}
      {/* 280-285: DEDICATED CSS & DESIGN GENERATORS */}
      {/* ======================================================== */}
      {toolId === 280 && <ColorConverterPanel />}
      {toolId === 281 && <GradientGeneratorPanel />}
      {toolId === 282 && <BoxShadowGeneratorPanel />}
      {toolId === 283 && <BorderRadiusGeneratorPanel />}
      {toolId === 284 && <FlexboxPlaygroundPanel />}
      {toolId === 285 && <GridGeneratorPanel />}

      {/* ======================================================== */}
      {/* 286-287: DEDICATED TIME & SCHEDULING TOOLS */}
      {/* ======================================================== */}
      {toolId === 286 && <UnixTimestampPanel />}
      {toolId === 287 && <CrontabHelperPanel />}

      {/* ======================================================== */}
      {/* 288-290: DEDICATED DIFF, URL & USER-AGENT INSPECTORS */}
      {/* ======================================================== */}
      {toolId === 288 && <DiffPatchPanel />}
      {toolId === 289 && <UrlParserPanel />}
      {toolId === 290 && <UserAgentParserPanel />}

      {/* ======================================================== */}
      {/* 291-292: DEDICATED HTTP & MIME TYPE DIRECTORIES */}
      {/* ======================================================== */}
      {toolId === 291 && <HttpStatusCodePanel />}
      {toolId === 292 && <MimeTypePanel />}

      {/* ======================================================== */}
      {/* 293-295: DEDICATED MARKDOWN, SQL INSERT & MOCK DATA GENERATORS */}
      {/* ======================================================== */}
      {toolId === 293 && <MarkdownFormatterPanel />}
      {toolId === 294 && <SqlInsertGeneratorPanel />}
      {toolId === 295 && <MockJsonGeneratorPanel />}

      {/* ======================================================== */}
      {/* 296-300: DEDICATED NETWORK, API, SECURITY & SYSTEM TOOLS */}
      {/* ======================================================== */}
      {toolId === 296 && <ApiRequestBuilderPanel />}
      {toolId === 297 && <CurlConverterPanel />}
      {toolId === 298 && <QrPayloadInspectorPanel />}
      {toolId === 299 && <CertificateInspectorPanel />}
      {toolId === 300 && <IpSubnetCalculatorPanel />}
    </div>
  );
};
