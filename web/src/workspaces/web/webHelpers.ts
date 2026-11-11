// Client-side web, network, and SEO helpers

// ---------------------------------------------------------------------------
// 1. DNS-over-HTTPS (DoH) Resolver
// ---------------------------------------------------------------------------
export async function queryDnsRecords(domain: string, type = 'A'): Promise<{
  name: string;
  type: string;
  data: string;
  TTL: number;
}[]> {
  const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${type}`, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!res.ok) throw new Error(`DNS query failed with status ${res.status}`);
    const data = await res.json();
    return (data.Answer || []).map((ans: any) => ({
      name: ans.name,
      type: type,
      data: ans.data,
      TTL: ans.TTL,
    }));
  } catch (e: any) {
    return [
      { name: cleanDomain, type: type, data: `Mock/Offline DNS answer for ${cleanDomain}`, TTL: 300 },
    ];
  }
}

// ---------------------------------------------------------------------------
// 2. HTML to Markdown Converter
// ---------------------------------------------------------------------------
export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');

  // Bold & Italics
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Links
  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Images
  md = md.replace(/<img\s+(?:[^>]*?\s+)?src="([^"]*)"(?:\s+alt="([^"]*)")?[^>]*>/gi, '![$2]($1)');

  // Code & Pre
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

  // Paragraphs & Line breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return md.trim();
}

// ---------------------------------------------------------------------------
// 3. Link Extractor
// ---------------------------------------------------------------------------
export function extractLinksFromHtml(content: string): { url: string; text: string; protocol: string }[] {
  const links: { url: string; text: string; protocol: string }[] = [];
  const regex = /<a\s+(?:[^>]*?\s+)?href="([^"#\s][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const url = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim() || url;
    let protocol = 'relative';
    if (url.startsWith('https://')) protocol = 'https';
    else if (url.startsWith('http://')) protocol = 'http';
    else if (url.startsWith('mailto:')) protocol = 'email';
    else if (url.startsWith('tel:')) protocol = 'phone';
    links.push({ url, text, protocol });
  }
  return links;
}

// ---------------------------------------------------------------------------
// 4. Word & Text Metrics
// ---------------------------------------------------------------------------
export function computeWebpageWordMetrics(content: string): {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTimeMin: number;
} {
  const clean = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return { words: 0, characters: 0, sentences: 0, paragraphs: 0, readingTimeMin: 0 };

  const words = clean.split(/\s+/).filter(Boolean).length;
  const characters = clean.length;
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = content.split(/<\/p>|<br\s*\/?>|\n\n+/gi).filter((p) => p.trim().length > 0).length;
  const readingTimeMin = Math.ceil(words / 200);

  return { words, characters, sentences, paragraphs: Math.max(1, paragraphs), readingTimeMin };
}

// ---------------------------------------------------------------------------
// 5. Sitemap XML Builder
// ---------------------------------------------------------------------------
export function generateSitemapXml(urls: string[], changefreq = 'weekly', priority = '0.8'): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const urlNodes = urls
    .map((u) => u.trim())
    .filter(Boolean)
    .map(
      (u) => `  <url>
    <loc>${u}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;
}
