// Advanced & System Tools Studio Offline Engines

export interface QrChunk {
  index: number;
  total: number;
  payload: string;
}

export function chunkPayloadForQrTransfer(data: string, chunkSize = 180): QrChunk[] {
  const chunks: QrChunk[] = [];
  if (!data) return chunks;

  const total = Math.ceil(data.length / chunkSize);
  for (let i = 0; i < total; i++) {
    const slice = data.slice(i * chunkSize, (i + 1) * chunkSize);
    chunks.push({
      index: i + 1,
      total,
      payload: `QR_PKG|${i + 1}/${total}|${slice}`,
    });
  }
  return chunks;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface DetailedDiffResult {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
  similarityRatio: number;
}

export function computeDetailedTextDiff(textA: string, textB: string): DetailedDiffResult {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');

  const diffLines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  const maxLines = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLines; i++) {
    const lineA = linesA[i];
    const lineB = linesB[i];

    if (lineA === lineB) {
      if (lineA !== undefined) {
        diffLines.push({ type: 'unchanged', text: `  ${lineA}` });
        unchanged++;
      }
    } else {
      if (lineA !== undefined && lineB !== undefined) {
        diffLines.push({ type: 'removed', text: `- ${lineA}` });
        diffLines.push({ type: 'added', text: `+ ${lineB}` });
        deletions++;
        additions++;
      } else if (lineA !== undefined) {
        diffLines.push({ type: 'removed', text: `- ${lineA}` });
        deletions++;
      } else if (lineB !== undefined) {
        diffLines.push({ type: 'added', text: `+ ${lineB}` });
        additions++;
      }
    }
  }

  const total = additions + deletions + unchanged;
  const similarityRatio = total > 0 ? Math.round((unchanged / total) * 100) : 100;

  return {
    lines: diffLines,
    additions,
    deletions,
    unchanged,
    similarityRatio,
  };
}

export interface FormulaSuggestion {
  formula: string;
  explanation: string;
  syntax: string;
  example: string;
}

export function generateSpreadsheetFormula(query: string): FormulaSuggestion {
  const norm = query.toLowerCase();

  if (norm.includes('lookup') || norm.includes('find') || norm.includes('search')) {
    if (norm.includes('exact') || norm.includes('xlookup')) {
      return {
        formula: '=XLOOKUP(lookup_value, lookup_array, return_array, "Not Found")',
        explanation: 'Modern flexible lookup that works in any direction without column index limits.',
        syntax: 'XLOOKUP(lookup_value, lookup_range, return_range, [if_not_found])',
        example: '=XLOOKUP(A2, Employees!A:A, Employees!C:C, "N/A")',
      };
    }
    return {
      formula: '=VLOOKUP(A2, B:D, 3, FALSE)',
      explanation: 'Searches for a key in the first column of a range and returns a value in the same row from another column.',
      syntax: 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      example: '=VLOOKUP(A2, Products!A:C, 3, FALSE)',
    };
  }

  if (norm.includes('sum') && (norm.includes('if') || norm.includes('condition') || norm.includes('criteria'))) {
    return {
      formula: '=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2)',
      explanation: 'Calculates the sum of cells that meet multiple specified conditions.',
      syntax: 'SUMIFS(sum_range, criteria_range1, criteria1, ...)',
      example: '=SUMIFS(Sales!D:D, Sales!B:B, "North", Sales!C:C, ">1000")',
    };
  }

  if (norm.includes('count') && norm.includes('if')) {
    return {
      formula: '=COUNTIFS(range1, criteria1, [range2, criteria2])',
      explanation: 'Counts the number of cells that satisfy one or more criteria.',
      syntax: 'COUNTIFS(criteria_range1, criteria1, ...)',
      example: '=COUNTIFS(Status!B:B, "Active", Status!C:C, "Pending Review")',
    };
  }

  if (norm.includes('average') && norm.includes('if')) {
    return {
      formula: '=AVERAGEIFS(average_range, criteria_range1, criteria1)',
      explanation: 'Finds the arithmetic mean for cells that satisfy multiple conditions.',
      syntax: 'AVERAGEIFS(average_range, criteria_range1, criteria1, ...)',
      example: '=AVERAGEIFS(Scores!C:C, Scores!A:A, "Grade 10")',
    };
  }

  return {
    formula: '=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))',
    explanation: 'Two-way dynamic lookup pairing INDEX and MATCH for high performance.',
    syntax: 'INDEX(array, MATCH(lookup_val, lookup_array, 0))',
    example: '=INDEX(Prices!C:C, MATCH(A2, Prices!A:A, 0))',
  };
}

export interface CsvChartData {
  headers: string[];
  rows: Array<{ label: string; value: number }>;
  maxVal: number;
  totalRows: number;
  chartAscii: string;
}

export function generateCsvBarChart(csvContent: string): CsvChartData {
  const lines = csvContent
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      maxVal: 0,
      totalRows: 0,
      chartAscii: 'No data to chart',
    };
  }

  const rows: Array<{ label: string; value: number }> = [];
  let headers: string[] = [];

  const firstParts = lines[0].split(',').map((p) => p.trim());
  const isFirstRowHeader = isNaN(Number(firstParts[firstParts.length - 1]));

  const dataLines = isFirstRowHeader ? lines.slice(1) : lines;
  if (isFirstRowHeader) {
    headers = firstParts;
  }

  let maxVal = 0;
  for (const line of dataLines) {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      const label = parts[0];
      const val = parseFloat(parts[parts.length - 1]) || 0;
      if (val > maxVal) maxVal = val;
      rows.push({ label, value: val });
    }
  }

  const barWidth = 24;
  const asciiLines: string[] = [];

  for (const r of rows) {
    const filled = maxVal > 0 ? Math.round((r.value / maxVal) * barWidth) : 0;
    const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, barWidth - filled));
    const labelPadded = (r.label.length > 12 ? r.label.slice(0, 11) + '…' : r.label).padEnd(12, ' ');
    asciiLines.push(`${labelPadded} | ${bar} ${r.value}`);
  }

  return {
    headers,
    rows,
    maxVal,
    totalRows: rows.length,
    chartAscii: asciiLines.join('\n'),
  };
}

export interface CleanedTableData {
  cleanedText: string;
  originalLines: number;
  cleanedLines: number;
  duplicatesRemoved: number;
  emptyLinesRemoved: number;
}

export function cleanTabularData(rawText: string): CleanedTableData {
  const rawLines = rawText.split('\n');
  const originalLines = rawLines.length;

  let emptyLinesRemoved = 0;
  const nonEmptyLines = rawLines
    .map((l) => l.trim())
    .filter((l) => {
      if (l.length === 0) {
        emptyLinesRemoved++;
        return false;
      }
      return true;
    });

  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  for (const line of nonEmptyLines) {
    if (!seen.has(line)) {
      seen.add(line);
      uniqueLines.push(line);
    }
  }

  const duplicatesRemoved = nonEmptyLines.length - uniqueLines.length;

  return {
    cleanedText: uniqueLines.join('\n'),
    originalLines,
    cleanedLines: uniqueLines.length,
    duplicatesRemoved,
    emptyLinesRemoved,
  };
}

export function classifyDocumentContent(text: string): {
  category: string;
  confidence: number;
  reason: string;
  tags: string[];
} {
  const lower = text.toLowerCase();

  if (
    lower.includes('confidentiality') ||
    lower.includes('hereby agrees') ||
    lower.includes('terms and conditions') ||
    lower.includes('non-disclosure') ||
    lower.includes('jurisdiction')
  ) {
    return {
      category: 'Legal Contract / Agreement',
      confidence: 96,
      reason: 'Contains formal legal boilerplate clauses, confidentiality covenants, and jurisdiction definitions.',
      tags: ['Legal', 'Contract', 'NDA', 'Compliance'],
    };
  }

  if (
    lower.includes('invoice') ||
    lower.includes('total amount due') ||
    lower.includes('subtotal') ||
    lower.includes('balance payable') ||
    lower.includes('tax id')
  ) {
    return {
      category: 'Financial Invoice / Bill',
      confidence: 94,
      reason: 'Contains itemized commercial charges, billing totals, and tax breakdowns.',
      tags: ['Finance', 'Invoice', 'Billing', 'Accounting'],
    };
  }

  if (
    lower.includes('function') ||
    lower.includes('import ') ||
    lower.includes('const ') ||
    lower.includes('class ') ||
    lower.includes('return ')
  ) {
    return {
      category: 'Source Code / Engineering',
      confidence: 98,
      reason: 'Detected syntax tokens, function signatures, and programming constructs.',
      tags: ['Code', 'Software', 'TypeScript', 'Engineering'],
    };
  }

  if (
    lower.includes('abstract') ||
    lower.includes('methodology') ||
    lower.includes('references') ||
    lower.includes('hypothesis')
  ) {
    return {
      category: 'Academic Research Paper',
      confidence: 91,
      reason: 'Contains structured academic apparatus including abstract and citations.',
      tags: ['Research', 'Academic', 'Publication'],
    };
  }

  return {
    category: 'General Notes / Documentation',
    confidence: 85,
    reason: 'Standard unstructured descriptive narrative text.',
    tags: ['Notes', 'Markdown', 'General'],
  };
}

export function scanAndRedactPii(text: string): {
  redactedText: string;
  redactionsCount: number;
  findings: string[];
} {
  let count = 0;
  const findings: string[] = [];

  // SSN: \b\d{3}-\d{2}-\d{4}\b
  let out = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, (match) => {
    count++;
    findings.push(`SSN: ${match}`);
    return '[REDACTED_SSN]';
  });

  // Credit Card: \b(?:\d{4}[-\s]?){3}\d{4}\b
  out = out.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, (match) => {
    count++;
    findings.push(`Credit Card: ****-****-****-${match.slice(-4)}`);
    return '[REDACTED_CARD]';
  });

  // Email: [A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (match) => {
    count++;
    findings.push(`Email: ${match}`);
    return '[REDACTED_EMAIL]';
  });

  // Phone numbers: \b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b
  out = out.replace(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, (match) => {
    count++;
    findings.push(`Phone: ${match}`);
    return '[REDACTED_PHONE]';
  });

  return {
    redactedText: out,
    redactionsCount: count,
    findings,
  };
}

export function computeHashSimilarity(hashA: string, hashB: string): {
  distance: number;
  similarityPercent: number;
  isMatch: boolean;
} {
  const cleanA = hashA.trim().toLowerCase();
  const cleanB = hashB.trim().toLowerCase();

  let distance = 0;
  const len = Math.max(cleanA.length, cleanB.length);

  for (let i = 0; i < len; i++) {
    if (cleanA[i] !== cleanB[i]) {
      distance++;
    }
  }

  const similarityPercent = len > 0 ? Math.max(0, Math.round(((len - distance) / len) * 100)) : 100;
  const isMatch = distance <= 2;

  return { distance, similarityPercent, isMatch };
}

export function recommendCompressionStrategy(filename: string, sizeBytes: number): {
  recommendedAlgorithm: string;
  expectedRatio: string;
  recommendationReason: string;
} {
  if (!filename.trim()) {
    return {
      recommendedAlgorithm: 'Awaiting Target File',
      expectedRatio: '—',
      recommendationReason: 'Enter or stage a filename to evaluate offline entropy and compression strategies.',
    };
  }

  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['png', 'jpg', 'jpeg', 'mp4', 'm4a', 'zip', 'gz'].includes(ext)) {
    return {
      recommendedAlgorithm: 'Pre-Compressed (Pass-Through)',
      expectedRatio: '0 - 5% additional reduction',
      recommendationReason: `File extension .${ext} already incorporates lossy/entropy-compressed packaging. Further deflation risks size inflation.`,
    };
  }

  if (['json', 'csv', 'txt', 'xml', 'svg', 'html'].includes(ext)) {
    return {
      recommendedAlgorithm: 'Brotli / Zstandard (Level 11)',
      expectedRatio: '70% - 85% reduction',
      recommendationReason: 'High repetitive lexical redundancy and plain text headers compress exceptionally with LZ77 and Huffman coding.',
    };
  }

  if (['pdf'].includes(ext)) {
    return {
      recommendedAlgorithm: 'FlateDecode / Stream Optimizer',
      expectedRatio: '25% - 45% reduction',
      recommendationReason: 'Target uncompressed embedded streams, metadata trees, and font descriptors.',
    };
  }

  return {
    recommendedAlgorithm: 'Deflate (Gzip Standard)',
    expectedRatio: '40% - 60% reduction',
    recommendationReason: 'General-purpose balanced compression ratio with minimal memory footprint.',
  };
}
