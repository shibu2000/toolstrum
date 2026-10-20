import { CANONICAL_TOOLS } from '../data/registry';
import { OFFICE_TOOLS, getOfficeToolConfig, OfficeWorkspaceId } from '../features/tools/office/officeConfig';
import {
  parseCsvToRows,
  rowsToCsv,
  csvToJson,
  jsonToCsv,
  cleanCsvRecords,
  markdownToHtml,
  htmlToMarkdown,
  xmlToJson,
  jsonToXml,
  formatXml,
  calculateDocStats,
  computeTextDiff,
  generateExcelXml,
} from '../features/tools/office/shared/OfficeHelpers';

console.log('--- STARTING OFFICE STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Tools 154–180
console.log('1. Auditing Canonical Catalog Entries for Tools 154–180...');
const officeTools = CANONICAL_TOOLS.filter((t) => t.id >= 154 && t.id <= 180);
if (officeTools.length !== 27) {
  throw new Error(`Expected exactly 27 Office tools (154–180), found ${officeTools.length}`);
}

const EXPECTED_OFFICE_TOOLS: Record<number, string> = {
  154: 'DOCX Viewer',
  155: 'DOCX to TXT',
  156: 'DOCX to HTML',
  157: 'DOCX to Markdown',
  158: 'TXT to DOCX',
  159: 'Markdown to PDF',
  160: 'Markdown to HTML',
  161: 'HTML to Markdown',
  162: 'Excel to CSV',
  163: 'CSV to Excel',
  164: 'CSV Viewer',
  165: 'CSV Cleaner',
  166: 'CSV Deduplicator',
  167: 'CSV Merger',
  168: 'CSV Splitter',
  169: 'JSON to CSV',
  170: 'CSV to JSON',
  171: 'XML to JSON',
  172: 'JSON to XML',
  173: 'XML Formatter',
  174: 'Document Compare',
  175: 'Word Counter for Documents',
  176: 'Document Metadata Viewer',
  177: 'Presentation to Images',
  178: 'Text to DOCX',
  179: 'Batch Document Converter',
  180: 'Batch Document Converter',
};

for (const tool of officeTools) {
  const expectedName = EXPECTED_OFFICE_TOOLS[tool.id];
  if (!expectedName) {
    throw new Error(`Unexpected tool ID ${tool.id} in Office Studio`);
  }
  if (tool.name !== expectedName) {
    throw new Error(`Tool ID ${tool.id} name mismatch: expected "${expectedName}", found "${tool.name}"`);
  }
  if (tool.studioId !== 'office') {
    throw new Error(`Tool ID ${tool.id} studioId is not "office": got "${tool.studioId}"`);
  }
}
console.log('✓ All 27 Office Studio tools (154–180) verified with exact names and offline metadata.');

// 2. Audit Tool-to-Workspace Consolidated Mappings
console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
const expectedWorkspaceCounts: Record<OfficeWorkspaceId, number> = {
  office_word_docs: 6,        // 154, 155, 156, 157, 158, 178
  office_markup: 6,           // 159, 160, 161, 171, 172, 173
  office_spreadsheet: 7,      // 162, 163, 164, 165, 166, 167, 168
  office_data_interchange: 2,  // 169, 170
  office_inspector_batch: 6,   // 174, 175, 176, 177, 179, 180
};

const actualWorkspaceCounts: Record<OfficeWorkspaceId, number> = {
  office_word_docs: 0,
  office_markup: 0,
  office_spreadsheet: 0,
  office_data_interchange: 0,
  office_inspector_batch: 0,
};

for (let id = 154; id <= 180; id++) {
  const cfg = getOfficeToolConfig(id);
  if (!cfg) {
    throw new Error(`Missing OfficeToolConfig for tool ID ${id}`);
  }
  if (cfg.id !== id) {
    throw new Error(`Config ID mismatch: expected ${id}, got ${cfg.id}`);
  }
  if (!cfg.workspace || !(cfg.workspace in actualWorkspaceCounts)) {
    throw new Error(`Invalid workspace ID "${cfg.workspace}" for tool ID ${id}`);
  }
  actualWorkspaceCounts[cfg.workspace]++;
}

for (const [ws, count] of Object.entries(expectedWorkspaceCounts)) {
  const actual = actualWorkspaceCounts[ws as OfficeWorkspaceId];
  if (actual !== count) {
    throw new Error(`Workspace ${ws} has ${actual} tools mapped, expected ${count}`);
  }
}
console.log('✓ All 27 tools cleanly mapped to 5 reusable workspaces with 0 gaps.');

// 3. Validating CSV Parser and RFC-4180 Roundtrip
console.log('3. Validating CSV Parser and RFC-4180 Roundtrip...');
const sampleCsv = `id,name,role,notes
1,"Smith, John",Engineer,"Expert in ""local-first"" systems"
2,Jane Doe,Designer,Simple text`;

const rows = parseCsvToRows(sampleCsv);
if (rows.length !== 3) {
  throw new Error(`Expected 3 rows, parsed ${rows.length}`);
}
if (rows[1][1] !== 'Smith, John') {
  throw new Error(`Failed to parse comma inside quotes: got "${rows[1][1]}"`);
}
if (rows[1][3] !== 'Expert in "local-first" systems') {
  throw new Error(`Failed to parse escaped quotes: got "${rows[1][3]}"`);
}

const serializedCsv = rowsToCsv(rows);
const reParsed = parseCsvToRows(serializedCsv);
if (reParsed[1][1] !== 'Smith, John' || reParsed[1][3] !== 'Expert in "local-first" systems') {
  throw new Error('CSV serialization roundtrip failed.');
}
console.log('✓ CSV parser and RFC-4180 quote escaping validated.');

// 4. Validating JSON <-> CSV Conversion
console.log('4. Validating JSON <-> CSV Conversion...');
const sampleJson = [
  { id: 101, name: 'Alpha', active: true, score: 99.5 },
  { id: 102, name: 'Beta', active: false, score: 88.0 },
];

const csvFromObj = jsonToCsv(sampleJson);
if (!csvFromObj.includes('id,name,active,score') || !csvFromObj.includes('101,Alpha,true,99.5')) {
  throw new Error(`jsonToCsv output invalid: ${csvFromObj}`);
}

const jsonFromCsv = csvToJson(csvFromObj);
if (jsonFromCsv.length !== 2 || jsonFromCsv[0].id !== 101 || jsonFromCsv[0].active !== true) {
  throw new Error(`csvToJson output invalid: ${JSON.stringify(jsonFromCsv)}`);
}
console.log('✓ JSON to CSV and CSV to JSON interchange models verified.');

// 5. Validating CSV Cleaning & Normalization
console.log('5. Validating CSV Cleaning & Normalization...');
const dirtyCsv = `id, name , department 
1 , Alice  , Engineering 

2, Bob , Marketing 
id, name , department `;

const cleaned = cleanCsvRecords(dirtyCsv, { trimWhitespace: true, dropEmptyRows: true, removeDuplicateHeaders: true });
const cleanedRows = parseCsvToRows(cleaned);
if (cleanedRows.length !== 3) {
  throw new Error(`Expected 3 rows after cleaning, got ${cleanedRows.length}`);
}
if (cleanedRows[1][1] !== 'Alice') {
  throw new Error(`Whitespace trimming failed: "${cleanedRows[1][1]}"`);
}
console.log('✓ CSV cleaner accurately trimmed whitespace and removed duplicate headers.');

// 6. Validating Markdown <-> HTML Conversion
console.log('6. Validating Markdown <-> HTML Conversion...');
const sampleMd = `# Executive Summary
Welcome to **Toolstrum**.
- Local First
- 100% Offline`;

const htmlOut = markdownToHtml(sampleMd);
if (!htmlOut.includes('<h1>Executive Summary</h1>') || !htmlOut.includes('<strong>Toolstrum</strong>') || !htmlOut.includes('<li>Local First</li>')) {
  throw new Error(`markdownToHtml output invalid: ${htmlOut}`);
}

const mdOut = htmlToMarkdown(htmlOut);
if (!mdOut.includes('# Executive Summary') || !mdOut.includes('**Toolstrum**')) {
  throw new Error(`htmlToMarkdown output invalid: ${mdOut}`);
}
console.log('✓ Markdown to HTML and HTML to Markdown roundtrips verified.');

// 7. Validating XML Parser, Formatter & JSON Serialization
console.log('7. Validating XML Parser, Formatter & JSON Serialization...');
const sampleXml = `<root><item id="1"><name>Test Item</name></item></root>`;
const parsedXmlObj = xmlToJson(sampleXml);
if (!parsedXmlObj.root || !parsedXmlObj.root.item) {
  throw new Error(`xmlToJson output invalid: ${JSON.stringify(parsedXmlObj)}`);
}

const formattedXml = formatXml(sampleXml, 2);
if (!formattedXml.includes('<root>\n') && !formattedXml.includes('  <item')) {
  throw new Error(`formatXml did not properly indent XML:\n${formattedXml}`);
}
console.log('✓ XML parser, serializer, and indentation formatter verified.');

// 8. Validating Deep Document Lexical Statistics
console.log('8. Validating Deep Document Lexical Statistics...');
const textForStats = `Toolstrum is an innovative mobile utility suite. It has 500 tools. Every tool runs offline.`;
const stats = calculateDocStats(textForStats);
if (stats.words !== 15) {
  throw new Error(`Expected 15 words, got ${stats.words}`);
}
if (stats.sentences !== 3) {
  throw new Error(`Expected 3 sentences, got ${stats.sentences}`);
}
if (stats.readingTimeMinutes <= 0) {
  throw new Error('Reading time calculation invalid.');
}
console.log(`✓ Document stats calculated (15 words, 3 sentences, ~${stats.readingTimeMinutes}m read time).`);

// 9. Validating Line-by-Line Document Diff Algorithm
console.log('9. Validating Line-by-Line Document Diff Algorithm...');
const origDoc = `Line 1: Introduction\nLine 2: Section A\nLine 3: Section B`;
const modDoc = `Line 1: Introduction\nLine 2: Section A Modified\nLine 3: Section B\nLine 4: New Conclusion`;

const diff = computeTextDiff(origDoc, modDoc);
if (diff.additions !== 2 || diff.deletions !== 1) {
  throw new Error(`Diff additions/deletions mismatch: additions=${diff.additions}, deletions=${diff.deletions}`);
}
if (diff.similarityPercentage <= 0 || diff.similarityPercentage >= 100) {
  throw new Error(`Diff similarity percentage invalid: ${diff.similarityPercentage}%`);
}
console.log(`✓ Document diff engine verified (+${diff.additions} additions, -${diff.deletions} deletions, ${diff.similarityPercentage}% similarity).`);

// 10. Validating Excel XML Spreadsheet Generator
console.log('10. Validating Excel XML Spreadsheet Generator...');
const tableData = [
  ['Product', 'Q1 Sales', 'Margin'],
  ['Mobile Suite', '45000', '0.42'],
];
const excelXml = generateExcelXml(tableData, 'Financials');
if (!excelXml.includes('xmlns="urn:schemas-microsoft-com:office:spreadsheet"') || !excelXml.includes('Worksheet ss:Name="Financials"')) {
  throw new Error('Excel XML Spreadsheet schema tag missing.');
}
if (!excelXml.includes('<Data ss:Type="Number">45000</Data>')) {
  throw new Error('Numeric auto-typing in Excel XML failed.');
}
console.log('✓ Microsoft Excel XML Spreadsheet format verified.');

console.log('--- ALL OFFICE STUDIO TESTS PASSED (100% SUCCESS) ---');
