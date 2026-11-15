// Toolstrum Developer Tools Pure Client-Side Engines & Helpers
// 100% Offline • Zero External Dependencies • 100% Client-Side

// ==========================================
// 1. MD5 PURE CLIENT-SIDE ALGORITHM
// ==========================================
export function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function wordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = convertToWordArray(unescape(encodeURIComponent(string)));
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], 9, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// ==========================================
// 2. YAML ENGINES (PARSE, FORMAT, VALIDATE, JSON CONVERSIONS)
// ==========================================
export function parseYamlValue(str: string): any {
  str = str.trim();
  if (str === 'true' || str === 'True' || str === 'yes') return true;
  if (str === 'false' || str === 'False' || str === 'no') return false;
  if (str === 'null' || str === 'Null' || str === '~' || str === '') return null;
  if (!isNaN(Number(str)) && str !== '') return Number(str);
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}

export function yamlToJsonObject(text: string): { data?: any; error?: string } {
  try {
    const lines = text.split('\n');
    const root: Record<string, any> = {};
    const stack: { indent: number; node: any; key: string | null; isArray?: boolean }[] = [
      { indent: -1, node: root, key: null },
    ];

    for (let idx = 0; idx < lines.length; idx++) {
      const raw = lines[idx];
      const stripped = raw.replace(/#.*$/, '');
      if (!stripped.trim()) continue;

      const indent = raw.search(/\S/);
      const content = stripped.trim();

      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }
      const current = stack[stack.length - 1];

      if (content.startsWith('- ')) {
        const rest = content.slice(2).trim();
        let targetArr: any[] | null = null;
        if (Array.isArray(current.node)) {
          targetArr = current.node;
        } else if (current.key && Array.isArray(current.node[current.key])) {
          targetArr = current.node[current.key];
        } else if (current.key) {
          targetArr = [];
          current.node[current.key] = targetArr;
        }

        if (!targetArr) {
          targetArr = [];
          if (current.key) current.node[current.key] = targetArr;
          else current.node = targetArr;
        }

        if (rest.includes(':')) {
          const colonIdx = rest.indexOf(':');
          const k = rest.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
          const vPart = rest.slice(colonIdx + 1).trim();
          const obj = { [k]: parseYamlValue(vPart) };
          targetArr.push(obj);
          stack.push({ indent, node: obj, key: k });
        } else {
          targetArr.push(parseYamlValue(rest));
        }
      } else if (content.includes(':')) {
        const colonIdx = content.indexOf(':');
        const key = content.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, '');
        const valPart = content.slice(colonIdx + 1).trim();

        if (valPart === '') {
          const peek = lines.slice(idx + 1).find((l) => l.replace(/#.*$/, '').trim().length > 0);
          const isNextList = peek ? peek.replace(/#.*$/, '').trim().startsWith('- ') : false;
          const newContainer = isNextList ? [] : {};
          if (Array.isArray(current.node)) {
            current.node.push({ [key]: newContainer });
          } else {
            current.node[key] = newContainer;
          }
          stack.push({ indent, node: newContainer, key, isArray: isNextList });
        } else {
          const val = parseYamlValue(valPart);
          if (Array.isArray(current.node)) {
            current.node.push({ [key]: val });
          } else {
            current.node[key] = val;
          }
        }
      }
    }
    return { data: root };
  } catch (e: any) {
    return { error: e.message || 'Malformed YAML syntax.' };
  }
}

export function jsonToYaml(obj: any, indent = 0): string {
  const spaces = ' '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'string') {
    return obj.includes('\n') || obj.includes(':') || obj.includes('#') ? JSON.stringify(obj) : obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const nested = jsonToYaml(item, indent + 2).trim();
          return `${spaces}- ${nested}`;
        }
        return `${spaces}- ${jsonToYaml(item, 0)}`;
      })
      .join('\n');
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    return keys
      .map((k) => {
        const v = obj[k];
        if (typeof v === 'object' && v !== null) {
          if (Array.isArray(v) && v.length === 0) return `${spaces}${k}: []`;
          if (!Array.isArray(v) && Object.keys(v).length === 0) return `${spaces}${k}: {}`;
          return `${spaces}${k}:\n${jsonToYaml(v, indent + 2)}`;
        }
        return `${spaces}${k}: ${jsonToYaml(v, 0)}`;
      })
      .join('\n');
  }
  return String(obj);
}

export function formatYaml(yamlStr: string, indentSize = 2): string {
  const parsed = yamlToJsonObject(yamlStr);
  if (parsed.error || !parsed.data) return yamlStr;
  return jsonToYaml(parsed.data, 0);
}

export function validateYaml(yamlStr: string): { valid: boolean; error?: string; line?: number } {
  if (!yamlStr.trim()) return { valid: false, error: 'YAML input is empty.' };
  const lines = yamlStr.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('\t')) {
      return { valid: false, error: `Tabs are forbidden in YAML. Use spaces for indentation.`, line: i + 1 };
    }
    const stripped = line.replace(/#.*$/, '').trim();
    if (stripped && stripped.includes(':') && !stripped.includes(': ') && !stripped.endsWith(':')) {
      return { valid: false, error: `Missing space after colon in key-value mapping.`, line: i + 1 };
    }
  }
  const parsed = yamlToJsonObject(yamlStr);
  if (parsed.error) return { valid: false, error: parsed.error };
  return { valid: true };
}

// ==========================================
// 3. XML VALIDATOR & FORMATTER
// ==========================================
export interface XmlValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  rootElement?: string;
  childCount?: number;
  nodes?: number;
  maxDepth?: number;
  cdataCount?: number;
  commentCount?: number;
  warnings?: string[];
}

function getXmlLineAndCol(text: string, index: number): { line: number; column: number } {
  const prefix = text.slice(0, index);
  const lines = prefix.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function validateXml(xmlStr: string): XmlValidationResult {
  if (!xmlStr || !xmlStr.trim()) {
    return { valid: false, error: 'Empty XML document' };
  }

  // If running in browser, also use DOMParser for strict native checks
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const text = parserError.textContent || '';
        const lineMatch = text.match(/line\s+(\d+)/i);
        const colMatch = text.match(/column\s+(\d+)/i);
        return {
          valid: false,
          error: text.split('\n')[0] || 'XML syntax or closing tag error',
          line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
          column: colMatch ? parseInt(colMatch[1], 10) : undefined,
        };
      }
    } catch {
      // Fallback to pure tokenizer check below
    }
  }

  const trimmed = xmlStr.trim();
  const warnings: string[] = [];
  let rootElement: string | undefined;
  let elementCount = 0;
  let cdataCount = 0;
  let commentCount = 0;
  let currentDepth = 0;
  let maxDepth = 0;

  if (trimmed.startsWith('<?xml')) {
    const declMatch = trimmed.match(/^<\?xml\s+version=(["'])(1\.[0-9]+)\1(?:\s+encoding=(["'])([a-zA-Z0-9\-_]+)\3)?(?:\s+standalone=(["'])(yes|no)\5)?\s*\?>/);
    if (!declMatch) {
      const declEnd = trimmed.indexOf('?>');
      const declStr = declEnd !== -1 ? trimmed.slice(0, declEnd + 2) : '<?xml ...';
      warnings.push(`XML declaration '${declStr}' has non-standard attributes or quotes.`);
    }
  }

  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/g;
  const stack: { name: string; line: number; column: number }[] = [];

  let match: RegExpExecArray | null;
  let hasRoot = false;
  let rootClosed = false;

  while ((match = tokenRegex.exec(xmlStr)) !== null) {
    const token = match[0];
    const index = match.index;
    const { line, column } = getXmlLineAndCol(xmlStr, index);

    if (token.startsWith('<!--')) {
      commentCount++;
      if (!token.endsWith('-->')) {
        return { valid: false, error: 'Unclosed XML comment', line, column };
      }
      continue;
    }

    if (token.startsWith('<![CDATA[')) {
      cdataCount++;
      if (!token.endsWith(']]>')) {
        return { valid: false, error: 'Unclosed CDATA section', line, column };
      }
      continue;
    }

    if (token.startsWith('<?') || token.startsWith('<!DOCTYPE')) {
      continue;
    }

    if (token.startsWith('</')) {
      const closeMatch = token.match(/^<\/\s*([a-zA-Z0-9_\-.:]+)\s*>$/);
      if (!closeMatch) {
        return { valid: false, error: `Malformed closing tag: ${token}`, line, column };
      }
      const closeName = closeMatch[1];
      if (stack.length === 0) {
        return {
          valid: false,
          error: `Unexpected closing tag </${closeName}> with no matching opening tag`,
          line,
          column,
        };
      }
      const last = stack.pop()!;
      if (last.name !== closeName) {
        return {
          valid: false,
          error: `Mismatched closing tag </${closeName}>, expected </${last.name}> (opened at line ${last.line}, col ${last.column})`,
          line,
          column,
        };
      }
      currentDepth--;
      if (stack.length === 0) {
        rootClosed = true;
      }
      continue;
    }

    if (token.startsWith('<')) {
      const isSelfClosing = token.endsWith('/>');
      const tagContent = isSelfClosing ? token.slice(1, -2).trim() : token.slice(1, -1).trim();
      const firstSpace = tagContent.search(/\s/);
      const tagName = firstSpace === -1 ? tagContent : tagContent.slice(0, firstSpace);

      if (!/^[a-zA-Z_][a-zA-Z0-9_\-.:]*$/.test(tagName)) {
        return { valid: false, error: `Invalid tag name: <${tagName}>`, line, column };
      }

      if (rootClosed && stack.length === 0) {
        return {
          valid: false,
          error: `Extra root element <${tagName}> found. XML allows only one top-level root element.`,
          line,
          column,
        };
      }

      if (!hasRoot) {
        hasRoot = true;
        rootElement = tagName;
      }

      elementCount++;
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;

      if (firstSpace !== -1) {
        const attrStr = tagContent.slice(firstSpace);
        const attrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        let attrMatch: RegExpExecArray | null;
        const seenAttrs = new Set<string>();

        while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
          const attrName = attrMatch[1];
          if (seenAttrs.has(attrName)) {
            warnings.push(`Duplicate attribute '${attrName}' on element <${tagName}> at line ${line}.`);
          }
          seenAttrs.add(attrName);

          if (attrMatch[4] !== undefined) {
            return {
              valid: false,
              error: `Unquoted attribute value for '${attrName}' in <${tagName}> at line ${line}`,
              line,
              column,
            };
          }
        }
      }

      if (isSelfClosing) {
        currentDepth--;
        if (stack.length === 0 && hasRoot) {
          rootClosed = true;
        }
      } else {
        stack.push({ name: tagName, line, column });
      }
      continue;
    }

    if (!token.trim()) continue;
    const nakedAmp = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g;
    if (nakedAmp.test(token)) {
      warnings.push(`Unescaped '&' found in text content at line ${line}. Use '&amp;' instead.`);
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      valid: false,
      error: `Unclosed XML tag: <${unclosed.name}> opened at line ${unclosed.line}, column ${unclosed.column}`,
      line: unclosed.line,
      column: unclosed.column,
    };
  }

  if (!hasRoot) {
    return { valid: false, error: 'Document does not contain any XML elements' };
  }

  return {
    valid: true,
    nodes: elementCount,
    childCount: elementCount,
    rootElement,
    maxDepth,
    cdataCount,
    commentCount,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function autoRepairXml(xmlStr: string): { repaired: string; repairs: string[] } {
  const repairs: string[] = [];
  let s = xmlStr;

  const ampCount = (s.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g) || []).length;
  if (ampCount > 0) {
    s = s.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g, '&amp;');
    repairs.push(`Escaped ${ampCount} raw '&' characters into '&amp;'`);
  }

  const unquotedAttrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)=([a-zA-Z0-9_\-.:/]+)(?=[\s>])/g;
  let unquotedFound = 0;
  s = s.replace(unquotedAttrRegex, (_, name, val) => {
    unquotedFound++;
    return `${name}="${val}"`;
  });
  if (unquotedFound > 0) {
    repairs.push(`Enclosed ${unquotedFound} unquoted attribute values in double quotes`);
  }

  const malformedClose = /<\s*([a-zA-Z_][a-zA-Z0-9_\-.:]*)([^>]*?)\s*\/\s*>/g;
  s = s.replace(malformedClose, '<$1$2 />');

  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>)/g;
  const stack: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(s)) !== null) {
    const t = m[0];
    if (t.startsWith('<!--') || t.startsWith('<![CDATA[') || t.startsWith('<?') || t.startsWith('<!DOCTYPE')) continue;
    if (t.startsWith('</')) {
      const matchName = t.match(/^<\/\s*([a-zA-Z0-9_\-.:]+)\s*>$/);
      if (matchName && stack.length > 0 && stack[stack.length - 1] === matchName[1]) {
        stack.pop();
      }
    } else if (t.startsWith('<') && !t.endsWith('/>')) {
      const firstSpace = t.search(/\s/);
      const name = firstSpace === -1 ? t.slice(1, -1) : t.slice(1, firstSpace);
      stack.push(name);
    }
  }

  if (stack.length > 0) {
    const closedTags: string[] = [];
    while (stack.length > 0) {
      const tag = stack.pop()!;
      s += `\n</${tag}>`;
      closedTags.push(tag);
    }
    repairs.push(`Auto-closed unclosed tags: </${closedTags.reverse().join('>, </')}>`);
  }

  return { repaired: s, repairs };
}

export function formatXml(
  xmlStr: string,
  indent: number | 'min' = 2,
  options: {
    wrapAttributes?: boolean;
    selfCloseEmpty?: boolean;
  } = {}
): string {
  if (!xmlStr || !xmlStr.trim()) return '';

  if (indent === 'min') {
    return xmlStr
      .replace(/>[\s\r\n]+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/<\s+/g, '<')
      .replace(/\s+>/g, '>')
      .replace(/\s*\/\s*>/g, ' />')
      .trim();
  }

  const space = ' '.repeat(typeof indent === 'number' ? indent : 2);
  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/g;

  const rawTokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(xmlStr)) !== null) {
    const tok = match[0].trim();
    if (tok.length > 0) {
      rawTokens.push(tok);
    }
  }

  const formattedLines: string[] = [];
  let depth = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    if (token.startsWith('<?') || token.startsWith('<!DOCTYPE') || token.startsWith('<!--') || token.startsWith('<![CDATA[')) {
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    if (token.startsWith('<') && token.endsWith('/>')) {
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    if (token.startsWith('<')) {
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1] : '';

      if (options.selfCloseEmpty && i + 1 < rawTokens.length && rawTokens[i + 1] === `</${tagName}>`) {
        const selfClosed = token.slice(0, -1).trim() + ' />';
        formattedLines.push(`${space.repeat(depth)}${selfClosed}`);
        i++;
        continue;
      }

      if (
        i + 2 < rawTokens.length &&
        !rawTokens[i + 1].startsWith('<') &&
        !rawTokens[i + 1].includes('\n') &&
        rawTokens[i + 2] === `</${tagName}>`
      ) {
        formattedLines.push(`${space.repeat(depth)}${token}${rawTokens[i + 1]}${rawTokens[i + 2]}`);
        i += 2;
        continue;
      }

      formattedLines.push(`${space.repeat(depth)}${token}`);
      depth++;
      continue;
    }

    formattedLines.push(`${space.repeat(depth)}${token}`);
  }

  return formattedLines.join('\n');
}

// ==========================================
// 4. HTML FORMATTER & MINIFIER
// ==========================================
// ==========================================
// 4. HTML FORMATTER & MINIFIER
// ==========================================
const VOID_HTML_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export interface HtmlFormatOptions {
  indent?: number | 'tab';
  wrapAttributes?: boolean;
  inlineTextElements?: boolean;
}

export function formatHtml(html: string, indent: number | 'tab' | HtmlFormatOptions = 2): string {
  if (!html || !html.trim()) return '';

  let options: HtmlFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentStr = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const wrapAttrs = options.wrapAttributes ?? false;
  const inlineText = options.inlineTextElements ?? true;

  const tokenRegex = /(<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/gi;

  const rawTokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(html)) !== null) {
    const tok = match[0].trim();
    if (tok.length > 0) {
      rawTokens.push(tok);
    }
  }

  const lines: string[] = [];
  let depth = 0;

  function formatTagAttrs(tag: string, currentIndent: string): string {
    if (!wrapAttrs || !tag.startsWith('<') || tag.startsWith('</') || tag.startsWith('<!')) return tag;
    const isSelfClosing = tag.endsWith('/>');
    const inner = isSelfClosing ? tag.slice(1, -2).trim() : tag.slice(1, -1).trim();
    const firstSpace = inner.search(/\s/);
    if (firstSpace === -1) return tag;

    const tagName = inner.slice(0, firstSpace);
    const attrStr = inner.slice(firstSpace).trim();
    const attrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
    const attrs: string[] = [];
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      attrs.push(attrMatch[0]);
    }

    if (attrs.length <= 2) return tag;

    const attrIndent = currentIndent + indentStr;
    const attrBlock = attrs.map((a) => `${attrIndent}${a}`).join('\n');
    return `<${tagName}\n${attrBlock}\n${currentIndent}${isSelfClosing ? '/>' : '>'}`;
  }

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    // Comments, DOCTYPE
    if (token.startsWith('<!--') || token.startsWith('<!DOCTYPE')) {
      lines.push(`${indentStr.repeat(depth)}${token}`);
      continue;
    }

    // Embedded Script or Style block
    if (/^<script[\s\S]*?<\/script>$/i.test(token) || /^<style[\s\S]*?<\/style>$/i.test(token)) {
      const openTagMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)[^>]*>/i);
      const openTag = openTagMatch ? openTagMatch[0] : '<script>';
      const closeTag = `</${openTagMatch ? openTagMatch[1] : 'script'}>`;
      const innerContent = token.slice(openTag.length, token.length - closeTag.length).trim();

      lines.push(`${indentStr.repeat(depth)}${openTag}`);
      if (innerContent) {
        const innerLines = innerContent.split('\n');
        for (const line of innerLines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            lines.push(`${indentStr.repeat(depth + 1)}${trimmedLine}`);
          }
        }
      }
      lines.push(`${indentStr.repeat(depth)}${closeTag}`);
      continue;
    }

    // Closing tag
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push(`${indentStr.repeat(depth)}${token}`);
      continue;
    }

    // Opening or Void / Self-closing tag
    if (token.startsWith('<')) {
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)/i);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isVoid = VOID_HTML_ELEMENTS.has(tagName) || token.endsWith('/>');

      if (isVoid) {
        const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
        lines.push(`${indentStr.repeat(depth)}${formattedTag}`);
        continue;
      }

      // Check if followed immediately by single-line text and matching closing tag
      if (
        inlineText &&
        i + 2 < rawTokens.length &&
        !rawTokens[i + 1].startsWith('<') &&
        !rawTokens[i + 1].includes('\n') &&
        rawTokens[i + 2].toLowerCase() === `</${tagName}>`
      ) {
        const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
        lines.push(`${indentStr.repeat(depth)}${formattedTag}${rawTokens[i + 1]}${rawTokens[i + 2]}`);
        i += 2;
        continue;
      }

      // Normal element
      const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
      lines.push(`${indentStr.repeat(depth)}${formattedTag}`);
      depth++;
      continue;
    }

    // Text content
    lines.push(`${indentStr.repeat(depth)}${token}`);
  }

  return lines.join('\n');
}

export interface HtmlMinifyOptions {
  stripComments?: boolean;
  collapseWhitespace?: boolean;
  minifyEmbeddedCss?: boolean;
  minifyEmbeddedJs?: boolean;
  removeBooleanAttributes?: boolean;
  removeEmptyAttributes?: boolean;
}

export function minifyHtml(html: string, options: HtmlMinifyOptions = {}): string {
  if (!html || !html.trim()) return '';

  const {
    stripComments = true,
    collapseWhitespace = true,
    minifyEmbeddedCss = true,
    minifyEmbeddedJs = true,
    removeBooleanAttributes = true,
    removeEmptyAttributes = false,
  } = options;

  let s = html;

  // 1. Minify embedded <style> blocks
  if (minifyEmbeddedCss) {
    s = s.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
      let minCss = css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Strip comments
        .replace(/\s*([{}:;,])\s*/g, '$1') // Strip spaces around delimiters
        .replace(/;}/g, '}') // Strip trailing semicolons
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim();
      return `<style${attrs}>${minCss}</style>`;
    });
  }

  // 2. Minify embedded <script> blocks
  if (minifyEmbeddedJs) {
    s = s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, js) => {
      let minJs = js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Strip block comments
        .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1') // Strip single-line comments (ignoring http://)
        .replace(/^\s+|\s+$/gm, '') // Trim lines
        .replace(/\n{2,}/g, '\n') // Collapse empty lines
        .trim();
      return `<script${attrs}>${minJs}</script>`;
    });
  }

  // 3. Strip HTML comments (preserving conditional comments e.g. <!--[if IE]>)
  if (stripComments) {
    s = s.replace(/<!--(?!\s*\[if)[\s\S]*?-->/gi, '');
  }

  // 4. Remove boolean attribute values: disabled="disabled" -> disabled
  if (removeBooleanAttributes) {
    s = s.replace(/\s+(disabled|checked|readonly|required|autofocus|multiple|selected)=["']\1["']/gi, ' $1');
  }

  // 5. Remove empty attributes: class="" -> ''
  if (removeEmptyAttributes) {
    s = s.replace(/\s+(class|id|style)=["']\s*["']/gi, '');
  }

  // 6. Collapse whitespace between tags and inside tags
  if (collapseWhitespace) {
    s = s
      .replace(/>[\s\r\n]+</g, '><') // Remove whitespace between tags
      .replace(/\s{2,}/g, ' ') // Collapse spaces
      .replace(/\s+>/g, '>') // Remove space before closing bracket
      .replace(/<\s+/g, '<') // Remove space after opening bracket
      .trim();
  }

  return s;
}

// ==========================================
// 5. CSS FORMATTER & MINIFIER
// ==========================================
export interface CssFormatOptions {
  indent?: number | 'tab';
  singleLineRules?: boolean;
  sortProperties?: boolean;
}

export function formatCss(cssStr: string, indent: number | 'tab' | CssFormatOptions = 2): string {
  if (!cssStr || !cssStr.trim()) return '';

  let options: CssFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentUnit = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const singleLine = options.singleLineRules ?? false;
  const sortProps = options.sortProperties ?? false;

  const protectedItems: string[] = [];
  let s = cssStr.replace(/(\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (match) => {
    protectedItems.push(match);
    return `__TOOLSTRUM_CSS_${protectedItems.length - 1}__`;
  });

  s = s.replace(/\s+/g, ' ').replace(/\s*([\{\};:])\s*/g, '$1');

  const restore = (str: string) =>
    str.replace(/__TOOLSTRUM_CSS_(\d+)__/g, (_, idx) => protectedItems[Number(idx)] || '');

  const resultLines: string[] = [];
  let depth = 0;
  let currentDeclarations: string[] = [];
  let currentToken = '';

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char === '{') {
      const selector = restore(currentToken.trim());
      currentToken = '';
      currentDeclarations = [];
      resultLines.push(`${indentUnit.repeat(depth)}${selector} {`);
      depth++;
      continue;
    }

    if (char === ';') {
      currentToken += char;
      const decl = currentToken.trim();
      currentToken = '';
      if (decl) {
        const colonIdx = decl.indexOf(':');
        if (colonIdx !== -1) {
          const prop = decl.slice(0, colonIdx).trim();
          const val = decl.slice(colonIdx + 1, -1).trim();
          currentDeclarations.push(`${prop}: ${val};`);
        } else {
          currentDeclarations.push(decl);
        }
      }
      continue;
    }

    if (char === '}') {
      const remainder = currentToken.trim();
      currentToken = '';
      if (remainder) {
        const colonIdx = remainder.indexOf(':');
        if (colonIdx !== -1) {
          const prop = remainder.slice(0, colonIdx).trim();
          const val = remainder.slice(colonIdx + 1).replace(/;$/, '').trim();
          currentDeclarations.push(`${prop}: ${val};`);
        } else {
          currentDeclarations.push(remainder);
        }
      }

      if (sortProps) {
        currentDeclarations.sort((a, b) => a.localeCompare(b));
      }

      depth = Math.max(0, depth - 1);

      if (singleLine && currentDeclarations.length > 0 && resultLines.length > 0 && resultLines[resultLines.length - 1].endsWith('{')) {
        const lastLine = resultLines.pop()!;
        const restoredProps = currentDeclarations.map(restore).join(' ');
        resultLines.push(`${lastLine} ${restoredProps} }`);
      } else {
        for (const decl of currentDeclarations) {
          resultLines.push(`${indentUnit.repeat(depth + 1)}${restore(decl)}`);
        }
        resultLines.push(`${indentUnit.repeat(depth)}}`);
      }

      currentDeclarations = [];
      if (depth === 0) {
        resultLines.push('');
      }
      continue;
    }

    currentToken += char;
  }

  const trailing = currentToken.trim();
  if (trailing) {
    resultLines.push(`${indentUnit.repeat(depth)}${restore(trailing)}`);
  }

  return resultLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export interface CssMinifyOptions {
  stripComments?: boolean;
  preserveSpecialComments?: boolean;
  removeTrailingSemicolons?: boolean;
  shortenHexColors?: boolean;
  removeLeadingZeros?: boolean;
  removeUnitZeros?: boolean;
}

export function minifyCss(css: string, options: CssMinifyOptions = {}): string {
  if (!css || !css.trim()) return '';

  const {
    stripComments = true,
    preserveSpecialComments = false,
    removeTrailingSemicolons = true,
    shortenHexColors = true,
    removeLeadingZeros = true,
    removeUnitZeros = true,
  } = options;

  let s = css;

  // 1. Comments
  if (preserveSpecialComments) {
    s = s.replace(/\/\*(?!\!)[\s\S]*?\*\//g, '');
  } else if (stripComments) {
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // 2. Whitespace & Delimiters
  s = s
    .replace(/\s+/g, ' ')
    .replace(/\s*([\{\};:,>+~])\s*/g, '$1');

  // 3. Trailing semicolons before closing brace
  if (removeTrailingSemicolons) {
    s = s.replace(/;}/g, '}');
  }

  // 4. Shorten 6-character hex colors to 3 characters: #ffffff -> #fff
  if (shortenHexColors) {
    s = s.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
  }

  // 5. Remove leading zeros: 0.5em -> .5em
  if (removeLeadingZeros) {
    s = s.replace(/(:|\s)0\.(\d+)/g, '$1.$2');
  }

  // 6. Remove units on zero values: 0px -> 0 (preserving calc and keyframe steps)
  if (removeUnitZeros) {
    s = s.replace(/(:|\s)0(px|em|rem|in|cm|mm|pt|pc|vh|vw|vmin|vmax)/gi, '$10');
  }

  // 7. Remove empty rulesets
  s = s.replace(/[^{}]+\{\s*\}/g, '');

  return s.trim();
}

// ==========================================
// 6. JS FORMATTER & MINIFIER
// ==========================================
export function formatJs(js: string): string {
  let depth = 0;
  const lines = js.split('\n');
  const result: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('}')) depth = Math.max(0, depth - 1);
    result.push('  '.repeat(depth) + trimmed);
    if (trimmed.endsWith('{')) depth++;
  }
  return result.join('\n');
}

export function minifyJs(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments
    .replace(/\/\/.*$/gm, '') // Single-line comments
    .replace(/\s+/g, ' ') // Collapse spaces
    .replace(/\s*([\{\}\(\)\[\]=;:,><+\-*\/])\s*/g, '$1')
    .trim();
}

// ==========================================
// 7. SQL FORMATTER, MINIFIER & EXPLAINER
// ==========================================
export function formatSql(sql: string): string {
  const majorKeywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'GROUP BY', 'ORDER BY',
    'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE FROM'
  ];
  let formatted = sql.trim();
  for (const kw of majorKeywords) {
    const reg = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(reg, `\n${kw}`);
  }
  return formatted.trim();
}

export function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '') // Line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Block comments
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SqlExplanation {
  type: string;
  tables: string[];
  columns: string[];
  filters: string[];
  joins: string[];
  grouping: string[];
  sorting: string[];
  limit: string;
  summary: string;
}

export function explainSql(sql: string): SqlExplanation {
  const clean = sql.replace(/\s+/g, ' ').trim();
  let type = 'SELECT';
  if (/^INSERT/i.test(clean)) type = 'INSERT';
  else if (/^UPDATE/i.test(clean)) type = 'UPDATE';
  else if (/^DELETE/i.test(clean)) type = 'DELETE';

  const tables: string[] = [];
  const fromMatch = clean.match(/FROM\s+([a-zA-Z0-9_,\s]+?)(?:WHERE|JOIN|GROUP|ORDER|LIMIT|$)/i);
  if (fromMatch) {
    tables.push(...fromMatch[1].split(',').map((t) => t.trim().split(/\s+/)[0]));
  }

  const joins: string[] = [];
  const joinMatches = clean.matchAll(/(?:LEFT|RIGHT|INNER|FULL|CROSS)?\s*JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+([^WHERE|GROUP|ORDER|LIMIT]+)/gi);
  for (const jm of joinMatches) {
    joins.push(`${jm[1]} (condition: ${jm[2].trim()})`);
  }

  const columns: string[] = [];
  const selectMatch = clean.match(/SELECT\s+(.*?)\s+FROM/i);
  if (selectMatch) {
    columns.push(...selectMatch[1].split(',').map((c) => c.trim()));
  }

  const filters: string[] = [];
  const whereMatch = clean.match(/WHERE\s+(.*?)(?:GROUP|ORDER|LIMIT|$)/i);
  if (whereMatch) {
    filters.push(whereMatch[1].trim());
  }

  const grouping: string[] = [];
  const groupMatch = clean.match(/GROUP BY\s+(.*?)(?:HAVING|ORDER|LIMIT|$)/i);
  if (groupMatch) {
    grouping.push(...groupMatch[1].split(',').map((g) => g.trim()));
  }

  const sorting: string[] = [];
  const orderMatch = clean.match(/ORDER BY\s+(.*?)(?:LIMIT|$)/i);
  if (orderMatch) {
    sorting.push(...orderMatch[1].split(',').map((o) => o.trim()));
  }

  const limitMatch = clean.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
  const limit = limitMatch ? `${limitMatch[1]} rows${limitMatch[2] ? ` (offset ${limitMatch[2]})` : ''}` : 'No limit specified (returns all matches)';

  const summary = `This ${type} query targets table(s) "${tables.join(', ') || 'unknown'}"${
    filters.length ? ` filtered by [${filters.join(' AND ')}]` : ''
  }${joins.length ? ` joined with ${joins.length} relation(s)` : ''}.`;

  return { type, tables, columns, filters, joins, grouping, sorting, limit, summary };
}

// ==========================================
// 8. REGEX EXPLAINER
// ==========================================
export interface RegexTokenExplanation {
  token: string;
  meaning: string;
  category: 'anchor' | 'character' | 'quantifier' | 'group' | 'logic';
}

export function explainRegex(pattern: string): RegexTokenExplanation[] {
  const tokens: RegexTokenExplanation[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === '^') {
      tokens.push({ token: '^', meaning: 'Asserts the start of the string or line.', category: 'anchor' });
      i++;
    } else if (char === '$') {
      tokens.push({ token: '$', meaning: 'Asserts the end of the string or line.', category: 'anchor' });
      i++;
    } else if (char === '\\') {
      const next = pattern[i + 1] || '';
      if (next === 'd') tokens.push({ token: '\\d', meaning: 'Matches any digit (equivalent to [0-9]).', category: 'character' });
      else if (next === 'D') tokens.push({ token: '\\D', meaning: 'Matches any non-digit character.', category: 'character' });
      else if (next === 'w') tokens.push({ token: '\\w', meaning: 'Matches any word character (letters, digits, underscore).', category: 'character' });
      else if (next === 'W') tokens.push({ token: '\\W', meaning: 'Matches any non-word character.', category: 'character' });
      else if (next === 's') tokens.push({ token: '\\s', meaning: 'Matches any whitespace character (space, tab, newline).', category: 'character' });
      else if (next === 'S') tokens.push({ token: '\\S', meaning: 'Matches any non-whitespace character.', category: 'character' });
      else if (next === 'b') tokens.push({ token: '\\b', meaning: 'Asserts a word boundary.', category: 'anchor' });
      else tokens.push({ token: `\\${next}`, meaning: `Escaped literal character "${next}".`, category: 'character' });
      i += 2;
    } else if (char === '[') {
      const end = pattern.indexOf(']', i);
      if (end !== -1) {
        const cls = pattern.slice(i, end + 1);
        tokens.push({ token: cls, meaning: `Character class matching any character in ${cls}.`, category: 'character' });
        i = end + 1;
      } else {
        tokens.push({ token: '[', meaning: 'Unclosed character class bracket.', category: 'character' });
        i++;
      }
    } else if (char === '+' || char === '*' || char === '?') {
      const desc = char === '+' ? 'Matches 1 or more times.' : char === '*' ? 'Matches 0 or more times.' : 'Matches 0 or 1 time (optional).';
      tokens.push({ token: char, meaning: desc, category: 'quantifier' });
      i++;
    } else if (char === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        const q = pattern.slice(i, end + 1);
        tokens.push({ token: q, meaning: `Quantifier matching ${q.slice(1, -1)} occurrences.`, category: 'quantifier' });
        i = end + 1;
      } else {
        tokens.push({ token: '{', meaning: 'Literal bracket', category: 'character' });
        i++;
      }
    } else if (char === '(') {
      if (pattern.startsWith('(?:', i)) {
        tokens.push({ token: '(?:...)', meaning: 'Non-capturing group.', category: 'group' });
        i += 3;
      } else {
        tokens.push({ token: '(', meaning: 'Starts a capturing group.', category: 'group' });
        i++;
      }
    } else if (char === ')') {
      tokens.push({ token: ')', meaning: 'Ends a capturing group.', category: 'group' });
      i++;
    } else if (char === '|') {
      tokens.push({ token: '|', meaning: 'Alternation (Boolean OR condition).', category: 'logic' });
      i++;
    } else if (char === '.') {
      tokens.push({ token: '.', meaning: 'Wildcard: matches any single character except newline.', category: 'character' });
      i++;
    } else {
      tokens.push({ token: char, meaning: `Literal character "${char}".`, category: 'character' });
      i++;
    }
  }

  return tokens;
}

// ==========================================
// 9. ENCODERS & DECODERS (BASE64, URL, HTML ENTITIES)
// ==========================================
export function encodeBase64(text: string, urlSafe = false, noPadding = false): string {
  let b64 = btoa(unescape(encodeURIComponent(text)));
  if (urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');
  }
  if (noPadding) {
    b64 = b64.replace(/=+$/, '');
  }
  return b64;
}

export function decodeBase64(b64: string): { text?: string; error?: string } {
  try {
    let clean = b64.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    const decoded = decodeURIComponent(escape(atob(clean)));
    return { text: decoded };
  } catch (e: any) {
    return { error: 'Invalid Base64 string encoding.' };
  }
}

export function encodeUrl(url: string, componentMode = false): string {
  return componentMode ? encodeURIComponent(url) : encodeURI(url);
}

export function decodeUrl(url: string, plusAsSpace = true): { text?: string; error?: string } {
  try {
    const input = plusAsSpace ? url.replace(/\+/g, ' ') : url;
    return { text: decodeURIComponent(input) };
  } catch (e: any) {
    return { error: 'Invalid URL percent-encoded sequence.' };
  }
}

export function encodeHtmlEntities(text: string, mode: 'named' | 'decimal' | 'hex' = 'named'): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    '€': '&euro;',
    '£': '&pound;',
    '¥': '&yen;',
  };

  if (mode === 'named') {
    return text.replace(/[&<>"'©®™€£¥]/g, (c) => map[c] || `&#${c.charCodeAt(0)};`);
  } else if (mode === 'decimal') {
    return text.replace(/[^\w\s]/g, (c) => `&#${c.charCodeAt(0)};`);
  } else {
    return text.replace(/[^\w\s]/g, (c) => `&#x${c.charCodeAt(0).toString(16)};`);
  }
}

export function decodeHtmlEntities(text: string): string {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent || text;
  }
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&copy;/g, '©');
}

// ==========================================
// 10. SECURITY TOOLS (JWT, UUID, ULID, HASHES, HMAC, PASSWORD, BCRYPT)
// ==========================================
export interface JwtDecoded {
  header: any;
  payload: any;
  signature: string;
  isValidStructure: boolean;
  isExpired: boolean;
  issuedAt?: string;
  expiresAt?: string;
  timeLeft?: string;
  error?: string;
}

export function decodeJwt(jwtStr: string): JwtDecoded {
  try {
    const parts = jwtStr.trim().split('.');
    if (parts.length < 2) return { header: null, payload: null, signature: '', isValidStructure: false, isExpired: false, error: 'JWT must have at least 2 segments separated by dots.' };

    const header = JSON.parse(decodeURIComponent(escape(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))));
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))));
    const signature = parts[2] || '';

    let isExpired = false;
    let issuedAt: string | undefined;
    let expiresAt: string | undefined;
    let timeLeft: string | undefined;

    if (payload.iat) {
      issuedAt = new Date(payload.iat * 1000).toLocaleString();
    }
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      expiresAt = expDate.toLocaleString();
      const diffMs = expDate.getTime() - Date.now();
      isExpired = diffMs < 0;
      const absMinutes = Math.abs(Math.floor(diffMs / 60000));
      timeLeft = isExpired ? `Expired ${absMinutes} minute(s) ago` : `Expires in ${absMinutes} minute(s)`;
    }

    return { header, payload, signature, isValidStructure: true, isExpired, issuedAt, expiresAt, timeLeft };
  } catch (e: any) {
    return { header: null, payload: null, signature: '', isValidStructure: false, isExpired: false, error: e.message || 'Invalid JWT' };
  }
}

export function generateUuids(count = 5, uppercase = false, noHyphens = false): string[] {
  const uuids: string[] = [];
  for (let i = 0; i < count; i++) {
    let id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    if (noHyphens) id = id.replace(/-/g, '');
    if (uppercase) id = id.toUpperCase();
    uuids.push(id);
  }
  return uuids;
}

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateUlids(count = 5): { ulid: string; timestamp: Date }[] {
  const result: { ulid: string; timestamp: Date }[] = [];
  const now = Date.now();
  for (let idx = 0; idx < count; idx++) {
    let t = now + idx;
    let timeStr = '';
    for (let i = 9; i >= 0; i--) {
      timeStr = CROCKFORD_BASE32[t % 32] + timeStr;
      t = Math.floor(t / 32);
    }
    let randStr = '';
    for (let i = 0; i < 16; i++) {
      randStr += CROCKFORD_BASE32[Math.floor(Math.random() * 32)];
    }
    result.push({
      ulid: timeStr + randStr,
      timestamp: new Date(now + idx),
    });
  }
  return result;
}

export async function computeHashes(text: string, uppercase = false): Promise<{ sha256: string; sha512: string; sha384: string; sha1: string; md5Hash: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const digestToHex = async (alg: string) => {
    try {
      const buf = await crypto.subtle.digest(alg, data);
      let hex = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      return uppercase ? hex.toUpperCase() : hex;
    } catch {
      return 'N/A';
    }
  };

  const [sha256, sha512, sha384, sha1] = await Promise.all([
    digestToHex('SHA-256'),
    digestToHex('SHA-512'),
    digestToHex('SHA-384'),
    digestToHex('SHA-1'),
  ]);

  const md5Hash = uppercase ? md5(text).toUpperCase() : md5(text);
  return { sha256, sha512, sha384, sha1, md5Hash };
}

export async function computeHmac(message: string, secret: string, algorithm: 'SHA-256' | 'SHA-512' | 'SHA-384'): Promise<{ hex: string; base64: string }> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const sigBytes = new Uint8Array(signature);
  const hex = Array.from(sigBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  let binary = '';
  for (let i = 0; i < sigBytes.byteLength; i++) {
    binary += String.fromCharCode(sigBytes[i]);
  }
  const base64 = btoa(binary);

  return { hex, base64 };
}

export function generatePassword(
  length = 16,
  options = { upper: true, lower: true, numbers: true, symbols: true, noAmbiguous: false }
): { password: string; strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong'; entropyBits: number } {
  let chars = '';
  if (options.upper) chars += options.noAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.lower) chars += options.noAmbiguous ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  if (options.numbers) chars += options.noAmbiguous ? '23456789' : '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+~|}{[]:;?><,./-=';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  const entropyBits = Math.round(length * Math.log2(chars.length));
  let strength: 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
  if (entropyBits >= 80) strength = 'Very Strong';
  else if (entropyBits >= 60) strength = 'Strong';
  else if (entropyBits >= 36) strength = 'Medium';

  return { password, strength, entropyBits };
}

export function inspectBcrypt(hash: string): {
  valid: boolean;
  version?: string;
  cost?: number;
  iterations?: number;
  salt?: string;
  checksum?: string;
  error?: string;
} {
  const match = hash.trim().match(/^\$(2a|2b|2y)\$(\d{2})\$([A-Za-z0-9\.\/]{22})([A-Za-z0-9\.\/]{31})$/);
  if (!match) {
    return { valid: false, error: 'Invalid Bcrypt hash format. Expected: $2a|2b|2y$rounds$salt22char...hash31char' };
  }
  const version = `$${match[1]}$`;
  const cost = parseInt(match[2], 10);
  const iterations = Math.pow(2, cost);
  const salt = match[3];
  const checksum = match[4];

  return { valid: true, version, cost, iterations, salt, checksum };
}

// ==========================================
// 11. COLOR CONVERTERS
// ==========================================
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  }
  return null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}
