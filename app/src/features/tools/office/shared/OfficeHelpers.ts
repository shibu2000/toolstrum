/**
 * Zero-dependency pure functions for Office & Document operations.
 * 100% testable in Bun, Node, and React Native environments.
 */

export interface DocStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  uniqueWords: number;
  lexicalDiversity: number;
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  text: string;
  lineNumOriginal?: number;
  lineNumModified?: number;
}

export interface DiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
  similarityPercentage: number;
}

/**
 * Robust RFC-4180 compliant CSV parser handling escaped commas and quotes.
 */
export function parseCsvToRows(csvText: string, delimiter = ','): string[][] {
  if (!csvText || !csvText.trim()) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      currentCell = '';
      if (currentRow.some((c) => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some((c) => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts a 2D array of strings into RFC-4180 CSV text.
 */
export function rowsToCsv(rows: string[][], delimiter = ','): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = String(cell ?? '');
          if (val.includes(delimiter) || val.includes('"') || val.includes('\n') || val.includes('\r')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(delimiter)
    )
    .join('\n');
}

/**
 * Convert tabular CSV to an array of typed or stringified JSON objects.
 */
export function csvToJson(csvText: string, autoCast = true): Record<string, any>[] {
  const rows = parseCsvToRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const results: Record<string, any>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj: Record<string, any> = {};

    headers.forEach((header, index) => {
      let val: any = row[index] !== undefined ? row[index].trim() : '';
      if (autoCast) {
        if (val.toLowerCase() === 'true') val = true;
        else if (val.toLowerCase() === 'false') val = false;
        else if (val !== '' && !isNaN(Number(val))) val = Number(val);
      }
      obj[header || `col_${index + 1}`] = val;
    });

    results.push(obj);
  }

  return results;
}

/**
 * Convert an array of JSON objects into tabular CSV.
 */
export function jsonToCsv(jsonArray: Record<string, any>[], delimiter = ','): string {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) return '';

  const headersSet = new Set<string>();
  jsonArray.forEach((item) => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach((k) => headersSet.add(k));
    }
  });

  const headers = Array.from(headersSet);
  const rows: string[][] = [headers];

  jsonArray.forEach((item) => {
    const row = headers.map((h) => {
      const val = item[h];
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });
    rows.push(row);
  });

  return rowsToCsv(rows, delimiter);
}

/**
 * Clean and sanitize CSV records.
 */
export function cleanCsvRecords(
  csvText: string,
  options: { trimWhitespace?: boolean; dropEmptyRows?: boolean; removeDuplicateHeaders?: boolean } = {}
): string {
  const { trimWhitespace = true, dropEmptyRows = true, removeDuplicateHeaders = true } = options;
  const rows = parseCsvToRows(csvText);
  if (rows.length === 0) return '';

  const headerRowStr = rows[0].map((c) => (trimWhitespace ? c.trim() : c)).join(',');
  const cleaned: string[][] = [];

  rows.forEach((row, idx) => {
    const processedRow = row.map((cell) => (trimWhitespace ? cell.trim() : cell));
    if (dropEmptyRows && processedRow.every((c) => c === '')) {
      return;
    }
    if (removeDuplicateHeaders && idx > 0 && processedRow.join(',') === headerRowStr) {
      return;
    }
    cleaned.push(processedRow);
  });

  return rowsToCsv(cleaned);
}

/**
 * Converts Markdown text into clean HTML syntax.
 */
export function markdownToHtml(mdText: string): string {
  if (!mdText) return '';

  const lines = mdText.split(/\r?\n/);
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Fenced Code Block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        htmlLines.push('</code></pre>');
        inCodeBlock = false;
      } else {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        codeBlockLang = line.trim().slice(3);
        htmlLines.push(`<pre><code class="language-${codeBlockLang || 'text'}">`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      htmlLines.push(
        line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h1>${formatInlineMd(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h2>${formatInlineMd(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<h3>${formatInlineMd(line.slice(4))}</h3>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (inList) { htmlLines.push('</ul>'); inList = false; }
      htmlLines.push(`<blockquote><p>${formatInlineMd(line.slice(2))}</p></blockquote>`);
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        htmlLines.push('<ul>');
        inList = true;
      }
      const itemContent = line.trim().slice(2);
      htmlLines.push(`  <li>${formatInlineMd(itemContent)}</li>`);
      continue;
    } else if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      htmlLines.push('<hr />');
      continue;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Paragraph
    htmlLines.push(`<p>${formatInlineMd(line)}</p>`);
  }

  if (inList) htmlLines.push('</ul>');
  if (inCodeBlock) htmlLines.push('</code></pre>');

  return htmlLines.join('\n');
}

function formatInlineMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * Converts simple HTML tags to Markdown.
 */
export function htmlToMarkdown(htmlText: string): string {
  if (!htmlText) return '';

  let md = htmlText;
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a\s+href="([^"]+)">([^<]+)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/gi, '> $1\n\n');
  md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul>|<\/ul>|<ol>|<\/ol>/gi, '\n');
  md = md.replace(/<p>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  // Strip any remaining html tags
  md = md.replace(/<[^>]+>/g, '');
  return md.trim();
}

/**
 * Lightweight XML to JSON object converter.
 */
export function xmlToJson(xmlText: string): Record<string, any> {
  const clean = xmlText.replace(/<\?xml.*?\?>/g, '').trim();

  function parseXmlContent(str: string): any {
    const obj: Record<string, any> = {};
    const tagRegex = /<([a-zA-Z0-9_\-]+)([^>]*)>(.*?)<\/\1>|<([a-zA-Z0-9_\-]+)([^>]*)\/>/gs;
    let match;
    let hasMatches = false;

    while ((match = tagRegex.exec(str)) !== null) {
      hasMatches = true;
      const tagName = match[1] || match[4];
      const innerContent = match[3] !== undefined ? match[3].trim() : '';

      const value = innerContent.includes('<') ? parseXmlContent(innerContent) : innerContent;

      if (obj[tagName]) {
        if (!Array.isArray(obj[tagName])) {
          obj[tagName] = [obj[tagName]];
        }
        obj[tagName].push(value);
      } else {
        obj[tagName] = value;
      }
    }

    if (!hasMatches) {
      return str.trim();
    }
    return obj;
  }

  return parseXmlContent(clean);
}

/**
 * Serializes a JSON object into formatted XML tags.
 */
export function jsonToXml(obj: any, rootTag = 'root', indent = 2): string {
  const spaces = ' '.repeat(indent);

  function serialize(val: any, tag: string, depth: number): string {
    const pad = ' '.repeat(depth * indent);
    if (val === null || val === undefined) {
      return `${pad}<${tag} />`;
    }
    if (Array.isArray(val)) {
      return val.map((item) => serialize(item, tag, depth)).join('\n');
    }
    if (typeof val === 'object') {
      const children = Object.entries(val)
        .map(([k, v]) => serialize(v, k, depth + 1))
        .join('\n');
      return `${pad}<${tag}>\n${children}\n${pad}</${tag}>`;
    }
    return `${pad}<${tag}>${String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${tag}>`;
  }

  const inner = Object.entries(obj)
    .map(([k, v]) => serialize(v, k, 1))
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${inner}\n</${rootTag}>`;
}

/**
 * Indent and format an XML string.
 */
export function formatXml(xmlText: string, indent = 2): string {
  let formatted = '';
  let pad = 0;
  const reg = /(>)(<)(\/*)/g;
  const xml = xmlText.replace(reg, '$1\r\n$2$3');
  const padStr = ' '.repeat(indent);

  xml.split('\r\n').forEach((node) => {
    let indentCount = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indentCount = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indentCount = 1;
    } else {
      indentCount = 0;
    }

    formatted += padStr.repeat(pad) + node + '\n';
    pad += indentCount;
  });

  return formatted.trim();
}

/**
 * Computes deep lexical and readability stats for document text.
 */
export function calculateDocStats(text: string): DocStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      uniqueWords: 0,
      lexicalDiversity: 0,
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const rawWords = text.trim().match(/\b[A-Za-z0-9_\-']+\b/g) || [];
  const words = rawWords.length;

  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length || (words > 0 ? 1 : 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (words > 0 ? 1 : 0);
  const lines = text.split(/\r?\n/).length;

  const readingTimeMinutes = Math.round((words / 200) * 10) / 10;
  const speakingTimeMinutes = Math.round((words / 130) * 10) / 10;

  const lowerWords = rawWords.map((w) => w.toLowerCase());
  const uniqueWords = new Set(lowerWords).size;
  const lexicalDiversity = words > 0 ? Math.round((uniqueWords / words) * 100) : 0;

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
    uniqueWords,
    lexicalDiversity,
  };
}

/**
 * Line-by-line document diff calculator.
 */
export function computeTextDiff(originalText: string, modifiedText: string): DiffResult {
  const origLines = originalText.split(/\r?\n/);
  const modLines = modifiedText.split(/\r?\n/);

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  const maxLen = Math.max(origLines.length, modLines.length);

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i];
    const m = modLines[i];

    if (o === undefined) {
      lines.push({ type: 'added', text: m, lineNumModified: i + 1 });
      additions++;
    } else if (m === undefined) {
      lines.push({ type: 'deleted', text: o, lineNumOriginal: i + 1 });
      deletions++;
    } else if (o === m) {
      lines.push({ type: 'unchanged', text: o, lineNumOriginal: i + 1, lineNumModified: i + 1 });
      unchanged++;
    } else {
      lines.push({ type: 'deleted', text: o, lineNumOriginal: i + 1 });
      lines.push({ type: 'added', text: m, lineNumModified: i + 1 });
      deletions++;
      additions++;
    }
  }

  const totalLines = additions + deletions + unchanged;
  const similarityPercentage =
    totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(additions, deletions))) * 100) : 100;

  return {
    lines,
    additions,
    deletions,
    unchanged,
    similarityPercentage,
  };
}

/**
 * Generates Microsoft Excel 2003 XML Spreadsheet (.xls/.xml format).
 * Natively opens as a fully styled spreadsheet in Microsoft Excel, Google Sheets, and Apple Numbers!
 */
export function generateExcelXml(rows: string[][], sheetName = 'Table1'): string {
  const xmlRows = rows
    .map((row) => {
      const cells = row
        .map((c) => {
          const isNum = !isNaN(Number(c)) && c.trim() !== '';
          const type = isNum ? 'Number' : 'String';
          const escaped = String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          return `    <Cell><Data ss:Type="${type}">${escaped}</Data></Cell>`;
        })
        .join('\n');
      return `   <Row>\n${cells}\n   </Row>`;
    })
    .join('\n');

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="${sheetName}">
  <Table>
${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;
}
