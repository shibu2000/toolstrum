import { CANONICAL_TOOLS } from '../data/registry';
import {
  DEVELOPER_TOOLS,
  getDeveloperToolConfig,
  DeveloperWorkspaceId,
} from '../features/tools/developer/developerConfig';
import {
  formatJson,
  validateJson,
  minifyJson,
  diffJson,
  queryJsonPath,
  jsonToTypeScript,
  jsonToSchema,
  jsonToYaml,
  yamlToJson,
  validateYaml,
  validateXml,
  generateMockJson,
  formatHtml,
  minifyHtml,
  formatCss,
  minifyCss,
  formatJs,
  minifyJs,
  formatSql,
  minifySql,
  explainSql,
  formatMarkdownCode,
  generateSqlInserts,
  testRegex,
  explainRegex,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHtmlEntities,
  decodeHtmlEntities,
  decodeJwt,
  parseUrl,
  parseUserAgent,
  generateUuidV4,
  generateUlid,
  generateCryptoHashes,
  generateHmac,
  generatePassword,
  inspectBcrypt,
  inspectQrPayload,
  inspectCertificatePem,
  convertColor,
  generateGradientCss,
  generateBoxShadowCss,
  generateBorderRadiusCss,
  generateFlexboxCss,
  generateGridCss,
  convertTimestamp,
  explainCron,
  parseDiffSummary,
  HTTP_STATUS_CODES,
  MIME_TYPES,
  buildCurlCommand,
  convertCurlToCode,
  calculateIpv4Subnet,
} from '../features/tools/developer/shared/DeveloperHelpers';

console.log('--- STARTING DEVELOPER STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Tools 244–300
console.log('1. Auditing Canonical Catalog Entries for Tools 244–300...');
const devTools = CANONICAL_TOOLS.filter((t) => t.id >= 244 && t.id <= 300);
if (devTools.length !== 57) {
  throw new Error(`Expected exactly 57 Developer tools (244–300), found ${devTools.length}`);
}

const EXPECTED_DEV_TOOLS: Record<number, string> = {
  244: 'JSON Formatter',
  245: 'JSON Validator',
  246: 'JSON Minifier',
  247: 'JSON Diff',
  248: 'JSON Path Tester',
  249: 'JSON to TypeScript',
  250: 'JSON Schema Generator',
  251: 'YAML Formatter',
  252: 'YAML Validator',
  253: 'YAML to JSON',
  254: 'JSON to YAML',
  255: 'XML Validator',
  256: 'HTML Formatter',
  257: 'HTML Minifier',
  258: 'CSS Formatter',
  259: 'CSS Minifier',
  260: 'JavaScript Formatter',
  261: 'JavaScript Minifier',
  262: 'SQL Formatter',
  263: 'SQL Minifier',
  264: 'SQL Query Explainer',
  265: 'Regex Tester',
  266: 'Regex Explainer',
  267: 'Base64 Encoder',
  268: 'Base64 Decoder',
  269: 'URL Encoder',
  270: 'URL Decoder',
  271: 'HTML Entity Encoder',
  272: 'HTML Entity Decoder',
  273: 'JWT Decoder',
  274: 'UUID Generator',
  275: 'ULID Generator',
  276: 'Hash Generator',
  277: 'HMAC Generator',
  278: 'Password Generator',
  279: 'Bcrypt Hash Checker',
  280: 'Color Code Converter',
  281: 'Gradient Generator',
  282: 'Box Shadow Generator',
  283: 'Border Radius Generator',
  284: 'Flexbox Playground',
  285: 'Grid Generator',
  286: 'Unix Timestamp Converter',
  287: 'Cron Expression Helper',
  288: 'Diff & Patch Viewer',
  289: 'URL Parser',
  290: 'User-Agent Parser',
  291: 'HTTP Status Code Reference',
  292: 'MIME Type Reference',
  293: 'Markdown Code Formatter',
  294: 'SQL Insert Generator',
  295: 'Mock JSON Generator',
  296: 'API Request Builder',
  297: 'cURL Converter',
  298: 'QR Payload Inspector',
  299: 'Certificate Inspector',
  300: 'IP Subnet Calculator',
};

for (const tool of devTools) {
  const expectedName = EXPECTED_DEV_TOOLS[tool.id];
  if (!expectedName) {
    throw new Error(`Unexpected tool ID ${tool.id} in Developer range`);
  }
  if (tool.name !== expectedName) {
    throw new Error(`Catalog mismatch for tool ${tool.id}: expected "${expectedName}", got "${tool.name}"`);
  }
}
console.log('✅ Canonical catalog integrity verified for all 57 tools (244–300).');

// 2. Audit Workspace Mapping in developerConfig
console.log('2. Auditing Workspace Configurations...');
const EXPECTED_WORKSPACES: Record<DeveloperWorkspaceId, number[]> = {
  dev_data_formats: [244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 295],
  dev_code_formatters: [256, 257, 258, 259, 260, 261, 262, 263, 264, 293, 294],
  dev_codecs_regex: [265, 266, 267, 268, 269, 270, 271, 272, 273, 289, 290],
  dev_security_identifiers: [274, 275, 276, 277, 278, 279, 298, 299],
  dev_css_generators: [280, 281, 282, 283, 284, 285],
  dev_network_api_time: [286, 287, 288, 291, 292, 296, 297, 300],
};

let totalMapped = 0;
for (const [workspace, ids] of Object.entries(EXPECTED_WORKSPACES)) {
  for (const id of ids) {
    const config = getDeveloperToolConfig(id);
    if (!config) {
      throw new Error(`Missing config for tool ID ${id}`);
    }
    if (config.workspace !== workspace) {
      throw new Error(`Tool ${id} mapped to wrong workspace: expected ${workspace}, got ${config.workspace}`);
    }
    if (!config.defaultOperation || config.supportedOperations.length === 0) {
      throw new Error(`Tool ${id} has incomplete operation definitions`);
    }
    totalMapped++;
  }
}

if (totalMapped !== 57) {
  throw new Error(`Expected 57 mapped tools across 6 workspaces, got ${totalMapped}`);
}
console.log('✅ All 57 tools successfully mapped across 6 consolidated workspaces.');

// 3. Test Data Formats (JSON, YAML, XML)
console.log('3. Testing Data Formats...');
const sampleJson = '{"app":"Toolstrum","tools":500,"active":true}';
const formatted = formatJson(sampleJson, 2);
if (!formatted.includes('  "app": "Toolstrum"')) throw new Error('formatJson failed');

const minified = minifyJson(formatted);
if (minified !== sampleJson) throw new Error('minifyJson failed');

const validCheck = validateJson(sampleJson);
if (!validCheck.valid) throw new Error('validateJson valid case failed');

const invalidCheck = validateJson('{bad json');
if (invalidCheck.valid) throw new Error('validateJson invalid case failed');

const diffs = diffJson('{"a":1,"b":2}', '{"a":1,"b":3,"c":4}');
if (diffs.length !== 2) throw new Error(`diffJson expected 2 diffs, got ${diffs.length}`);

const qVal = queryJsonPath('{"user":{"name":"Alex"}}', '$.user.name');
if (qVal !== 'Alex') throw new Error('queryJsonPath failed');

const tsCode = jsonToTypeScript(sampleJson, 'AppConfig');
if (!tsCode.includes('export interface AppConfig')) throw new Error('jsonToTypeScript failed');

const schema = jsonToSchema(sampleJson);
if (!schema.includes('"type": "object"')) throw new Error('jsonToSchema failed');

const yaml = jsonToYaml(sampleJson);
if (!yaml.includes('app: "Toolstrum"')) throw new Error('jsonToYaml failed');

const backJson = yamlToJson(yaml);
if (!backJson.includes('"app": "Toolstrum"')) throw new Error('yamlToJson failed');

const xmlValid = validateXml('<root><item>Hello</item></root>');
if (!xmlValid.valid) throw new Error('validateXml valid case failed');

const xmlInvalid = validateXml('<root><item>Hello</root>');
if (xmlInvalid.valid) throw new Error('validateXml invalid case failed');

const mock = generateMockJson('users', 2);
if (!mock.includes('user1@example.com')) throw new Error('generateMockJson failed');
console.log('✅ Data Formats verified.');

// 4. Test Code Formatters & Minifiers
console.log('4. Testing Code Formatters & Minifiers...');
const html = '<div><p>Hello</p></div>';
if (formatHtml(html).split('\n').length < 3) throw new Error('formatHtml failed');
if (!minifyHtml('<div>   <p> Hello </p>  </div>').includes('<div><p> Hello </p></div>')) {
  throw new Error('minifyHtml failed');
}

const css = '.a{color:red;margin:0;}';
if (!formatCss(css).includes('  color: red;')) throw new Error('formatCss failed');
if (!minifyCss('.a { color: red; }').includes('.a{color:red}')) throw new Error('minifyCss failed');

const js = 'function test() { return 1; }';
if (!formatJs(js).includes('function test()')) throw new Error('formatJs failed');
if (!minifyJs('// comment\nlet a = 1;').includes('let a=1;')) throw new Error('minifyJs failed');

const sql = 'SELECT id, name FROM users WHERE active = 1';
if (!formatSql(sql).includes('FROM users')) throw new Error('formatSql failed');
if (!minifySql('SELECT * \n FROM users -- comment').includes('SELECT * FROM users')) {
  throw new Error('minifySql failed');
}

const sqlExp = explainSql(sql);
if (sqlExp.length < 3) throw new Error('explainSql failed');

const inserts = generateSqlInserts('users', '[{"id":1,"name":"Alice"}]');
if (!inserts.includes("INSERT INTO users (id, name) VALUES (1, 'Alice');")) {
  throw new Error('generateSqlInserts failed');
}
console.log('✅ Code Formatters & Minifiers verified.');

// 5. Test Web, Regex & Codecs
console.log('5. Testing Web, Regex & Codecs...');
const regexRes = testRegex('\\d+', 'g', 'abc 123 def 456');
if (regexRes.count !== 2 || regexRes.matches[0] !== '123') throw new Error('testRegex failed');

const b64 = encodeBase64('Toolstrum');
if (decodeBase64(b64) !== 'Toolstrum') throw new Error('Base64 codec failed');

const urlEnc = encodeUrl('https://example.com/test?a=b c');
if (decodeUrl(urlEnc) !== 'https://example.com/test?a=b c') throw new Error('URL codec failed');

const htmlEnt = encodeHtmlEntities('<b>&"\'</b>');
if (decodeHtmlEntities(htmlEnt) !== '<b>&"\'</b>') throw new Error('HTML entity codec failed');

const dummyJwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYiLCJleHAiOjE5OTk5OTk5OTl9.sig';
const jwtDecoded = decodeJwt(dummyJwt);
if (jwtDecoded.payload.sub !== '123456' || jwtDecoded.expired) throw new Error('decodeJwt failed');

const parsedUrl = parseUrl('https://toolstrum.app:8080/docs?ref=mobile#intro');
if (parsedUrl.host !== 'toolstrum.app:8080' || parsedUrl.searchParams.ref !== 'mobile') {
  throw new Error('parseUrl failed');
}

const ua = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
if (!ua.device.includes('iOS')) throw new Error('parseUserAgent failed');
console.log('✅ Web, Regex & Codecs verified.');

// 6. Test Security & Identifiers
console.log('6. Testing Security & Identifiers...');
const uuid = generateUuidV4();
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)) {
  throw new Error('generateUuidV4 failed');
}

const ulid = generateUlid();
if (ulid.length !== 26) throw new Error('generateUlid failed');

const hashes = generateCryptoHashes('hello');
if (hashes.md5 !== '5d41402abc4b2a76b9719d911017c592') throw new Error('MD5 hash failed');
if (hashes.sha1 !== 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d') throw new Error('SHA-1 hash failed');
if (hashes.sha256 !== '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824') {
  throw new Error('SHA-256 hash failed');
}

const hmac = generateHmac('msg', 'key');
if (!hmac || hmac.length !== 64) throw new Error('generateHmac failed');

const pwd = generatePassword(16, { upper: true, numbers: true });
if (pwd.password.length !== 16 || pwd.entropyBits < 50) throw new Error('generatePassword failed');

const bcryptAudit = inspectBcrypt('$2a$12$e8uq5e5qE4X11Z8R.mFvKuYfQ3eN5G6h7i8j9k0l1m2n3o4p5q6r7');
if (!bcryptAudit.valid || bcryptAudit.cost !== 12) throw new Error('inspectBcrypt failed');

const qrAudit = inspectQrPayload('WIFI:S:MyNet;T:WPA;P:pass;;');
if (qrAudit.type !== 'WiFi Network' || qrAudit.details.SSID !== 'MyNet') {
  throw new Error('inspectQrPayload failed');
}

const certAudit = inspectCertificatePem('-----BEGIN CERTIFICATE-----\nMIIEczCCA1ugAwIBAgIBADANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdSb290\n-----END CERTIFICATE-----');
if (!certAudit.valid) throw new Error('inspectCertificatePem failed');
console.log('✅ Security & Identifiers verified.');

// 7. Test CSS & Layout Generators
console.log('7. Testing CSS & Layout Generators...');
const col = convertColor('#625BFF');
if (col.rgb !== 'rgb(98, 91, 255)') throw new Error('convertColor failed');

const grad = generateGradientCss('linear', 90, '#000', '#fff');
if (!grad.includes('linear-gradient(90deg, #000 0%, #fff 100%)')) throw new Error('generateGradientCss failed');

const shadow = generateBoxShadowCss(0, 4, 12, 0, '#000', false);
if (!shadow.includes('box-shadow: 0px 4px 12px 0px #000;')) throw new Error('generateBoxShadowCss failed');

const radius = generateBorderRadiusCss(8, 8, 8, 8);
if (!radius.includes('border-radius: 8px;')) throw new Error('generateBorderRadiusCss failed');

const flex = generateFlexboxCss('row', 'center', 'center', 'nowrap');
if (!flex.includes('display: flex;')) throw new Error('generateFlexboxCss failed');

const grid = generateGridCss(3, 2, 16);
if (!grid.includes('repeat(3, 1fr)')) throw new Error('generateGridCss failed');
console.log('✅ CSS & Layout Generators verified.');

// 8. Test Network, Time & API Reference
console.log('8. Testing Network, Time & API Reference...');
const ts = convertTimestamp(1767225600);
if (!ts.iso.startsWith('2026-')) throw new Error('convertTimestamp failed');

const cron = explainCron('0 9 * * 1-5');
if (!cron.valid || !cron.description.includes('09:00 AM on weekdays')) throw new Error('explainCron failed');

const patch = parseDiffSummary('diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n+line1\n-line2');
if (patch.additions !== 1 || patch.deletions !== 1) throw new Error('parseDiffSummary failed');

if (HTTP_STATUS_CODES[200].title !== 'OK' || HTTP_STATUS_CODES[404].title !== 'Not Found') {
  throw new Error('HTTP_STATUS_CODES failed');
}

if (MIME_TYPES.json !== 'application/json' || MIME_TYPES.pdf !== 'application/pdf') {
  throw new Error('MIME_TYPES failed');
}

const curlCmd = buildCurlCommand('GET', 'https://api.toolstrum.app', { Authorization: 'Bearer token' });
if (!curlCmd.includes('curl -X GET') || !curlCmd.includes('Authorization: Bearer token')) {
  throw new Error('buildCurlCommand failed');
}

const fetchCode = convertCurlToCode(curlCmd, 'fetch');
if (!fetchCode.includes("fetch('https://api.toolstrum.app'")) throw new Error('convertCurlToCode failed');

const subnet = calculateIpv4Subnet('192.168.1.0/24');
if (subnet.netmask !== '255.255.255.0' || subnet.broadcast !== '192.168.1.255' || subnet.usableHosts !== 254) {
  throw new Error('calculateIpv4Subnet failed');
}
console.log('✅ Network, Time & API Reference verified.');

console.log('--- ALL DEVELOPER STUDIO TESTS PASSED WITH 100% SUCCESS ---');
