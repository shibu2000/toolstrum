import { CANONICAL_TOOLS } from '../data/registry';
import {
  WEB_TOOLS_CONFIG,
  getWebToolConfig,
} from '../features/tools/web/webConfig';
import {
  shortenUrl,
  expandUrl,
  extractLinksFromHtml,
  validateUrlStructure,
  parseHtmlMetadata,
  generateMetaTags,
  parseRobotsTxt,
  parseSitemapXml,
  generateSitemapXml,
  generateDnsLookup,
  classifyIp,
  calculateSubnet,
  runSyntheticSpeedTest,
  runLatencyBenchmark,
  inspectStandardHeaders,
  inspectSslCertificate,
  generateDataUri,
  htmlToMarkdown,
  analyzeWebpageContent,
} from '../features/tools/web/shared/WebHelpers';

console.log('--- STARTING WEB & INTERNET STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 376–400
console.log('1. Auditing Canonical Catalog Entries for Tools 376–400...');
const webTools = CANONICAL_TOOLS.filter((t) => t.id >= 376 && t.id <= 400);
if (webTools.length !== 25) {
  throw new Error(`Expected exactly 25 Web & Internet tools (376–400), found ${webTools.length}`);
}

for (let id = 376; id <= 400; id++) {
  const config = getWebToolConfig(id);
  if (!config) {
    throw new Error(`Missing web configuration for tool ID ${id}`);
  }
  if (config.id !== id || !config.title || !config.workspaceId) {
    throw new Error(`Invalid configuration for tool ID ${id}`);
  }
}
console.log('✔ All 25 Web & Internet tools are canonically registered and configured.');

// 2. Workspace Group Distribution
console.log('2. Verifying Workspace Group Distributions...');
const groups: Record<string, number> = {
  web_url_links: 0,
  web_meta_seo: 0,
  web_network_inspector: 0,
  web_html_content: 0,
};

for (let id = 376; id <= 400; id++) {
  const config = getWebToolConfig(id)!;
  groups[config.workspaceId]++;
}

if (groups.web_url_links !== 6) {
  throw new Error(`Expected 6 URL/links tools, got ${groups.web_url_links}`);
}
if (groups.web_meta_seo !== 6) {
  throw new Error(`Expected 6 SEO/meta tools, got ${groups.web_meta_seo}`);
}
if (groups.web_network_inspector !== 7) {
  throw new Error(`Expected 7 network inspector tools, got ${groups.web_network_inspector}`);
}
if (groups.web_html_content !== 6) {
  throw new Error(`Expected 6 HTML/content tools, got ${groups.web_html_content}`);
}
console.log('✔ All 4 Web & Internet workspaces correctly partition the 25 tools.');

// 3. URL & Link Utilities Tests
console.log('3. Testing URL & Link Utilities...');
const shortRes = shortenUrl('https://developer.toolstrum.app/documentation/offline-local-utilities/v2', 'offline-v2');
if (shortRes.shortUrl !== 'https://tool.st/offline-v2' || shortRes.savingsPercent <= 0) {
  throw new Error(`Shorten URL failed: ${JSON.stringify(shortRes)}`);
}

const expandRes = expandUrl('https://tool.st/offline-v2');
if (!expandRes.domain || expandRes.redirectsCount < 1) {
  throw new Error(`Expand URL failed: ${JSON.stringify(expandRes)}`);
}

const htmlSample = '<nav><a href="/about">About</a><a href="https://google.com">Google</a><a href="#section">Top</a></nav>';
const extracted = extractLinksFromHtml(htmlSample);
if (extracted.length !== 3) {
  throw new Error(`Expected 3 extracted links, got ${extracted.length}`);
}
if (extracted[0].type !== 'Internal' || extracted[1].type !== 'External' || extracted[2].type !== 'Anchor') {
  throw new Error(`Link type categorization failed: ${JSON.stringify(extracted)}`);
}

const validReport = validateUrlStructure('https://api.toolstrum.app:8443/v1/telemetry?q=test#top');
if (!validReport.isValid || validReport.port !== '8443' || validReport.protocol !== 'https') {
  throw new Error(`Valid URL failed validation: ${JSON.stringify(validReport)}`);
}

const invalidReport = validateUrlStructure('ht!tp://bad-url');
if (invalidReport.isValid) {
  throw new Error('Invalid URL incorrectly classified as valid');
}
console.log('✔ URL and Link algorithms validated.');

// 4. SEO & Metadata Tests
console.log('4. Testing SEO & Metadata Parsers / Generators...');
const metaHtml = `
<head>
  <title>Toolstrum App</title>
  <meta name="description" content="Offline utility suite." />
  <link rel="canonical" href="https://toolstrum.app" />
  <meta property="og:title" content="Toolstrum Social" />
</head>`;
const meta = parseHtmlMetadata(metaHtml);
if (meta.title !== 'Toolstrum App' || meta.description !== 'Offline utility suite.' || meta.canonical !== 'https://toolstrum.app') {
  throw new Error(`HTML metadata parsing failed: ${JSON.stringify(meta)}`);
}

const metaTags = generateMetaTags({
  title: 'My Site',
  description: 'Desc test',
  url: 'https://mysite.com',
  image: 'https://mysite.com/img.png',
});
if (!metaTags.includes('<title>My Site</title>') || !metaTags.includes('og:image') || !metaTags.includes('twitter:card')) {
  throw new Error(`Meta tags generation incomplete: ${metaTags}`);
}

const robotsSample = `
User-agent: *
Disallow: /admin/
Allow: /public/
Crawl-delay: 2
Sitemap: https://mysite.com/sitemap.xml
`;
const robotsRules = parseRobotsTxt(robotsSample);
if (robotsRules.length !== 1 || robotsRules[0].disallowed[0] !== '/admin/' || robotsRules[0].crawlDelay !== 2) {
  throw new Error(`Robots.txt parsing failed: ${JSON.stringify(robotsRules)}`);
}

const sitemapEntries = [
  { loc: 'https://mysite.com/', changefreq: 'daily', priority: '1.0' },
  { loc: 'https://mysite.com/docs', changefreq: 'weekly', priority: '0.8' },
];
const sitemapXml = generateSitemapXml(sitemapEntries);
const parsedSitemap = parseSitemapXml(sitemapXml);
if (parsedSitemap.length !== 2 || parsedSitemap[0].loc !== 'https://mysite.com/') {
  throw new Error(`Sitemap XML roundtrip failed: ${sitemapXml}`);
}
console.log('✔ SEO & Metadata operations validated.');

// 5. Network, DNS & Server Diagnostic Tests
console.log('5. Testing Network, DNS & Diagnostics...');
const dns = generateDnsLookup('toolstrum.app');
if (dns.length < 5 || !dns.some((r) => r.type === 'A') || !dns.some((r) => r.type === 'MX')) {
  throw new Error('DNS zone lookup failed');
}

const privateIp = classifyIp('192.168.1.50');
if (!privateIp.isRfc1918 || privateIp.scope !== 'Private' || privateIp.version !== 'IPv4') {
  throw new Error(`Private IP classification failed: ${JSON.stringify(privateIp)}`);
}

const loopbackIp = classifyIp('127.0.0.1');
if (loopbackIp.scope !== 'Loopback') {
  throw new Error(`Loopback IP classification failed: ${JSON.stringify(loopbackIp)}`);
}

const publicIp = classifyIp('8.8.8.8');
if (publicIp.scope !== 'Public') {
  throw new Error(`Public IP classification failed: ${JSON.stringify(publicIp)}`);
}

const subnet = calculateSubnet('192.168.1.0', 24);
if (subnet.subnetMask !== '255.255.255.0' || subnet.usableHostCount !== 254 || subnet.broadcastAddress !== '192.168.1.255') {
  throw new Error(`Subnet calculation failed: ${JSON.stringify(subnet)}`);
}

const speed = runSyntheticSpeedTest();
if (speed.downloadMbps <= 0 || speed.uploadMbps <= 0 || speed.pingMs <= 0) {
  throw new Error(`Speed test benchmark failed: ${JSON.stringify(speed)}`);
}

const latency = runLatencyBenchmark('8.8.8.8');
if (latency.packetsSent !== 5 || latency.avgPing <= 0) {
  throw new Error(`Latency benchmark failed: ${JSON.stringify(latency)}`);
}

const headers = inspectStandardHeaders('example.com');
if (headers.length < 5 || !headers.some((h) => h.name === 'Strict-Transport-Security')) {
  throw new Error('HTTP headers inspector failed');
}
console.log('✔ Network and Diagnostics operations validated.');

// 6. HTML & Content Utilities Tests
console.log('6. Testing HTML & Content Utilities...');
const ssl = inspectSslCertificate('toolstrum.app');
if (ssl.status !== 'Valid' || ssl.daysRemaining <= 0 || !ssl.issuer) {
  throw new Error(`SSL certificate verification failed: ${JSON.stringify(ssl)}`);
}

const dataUri = generateDataUri('<h1>Hello</h1>', 'text/html');
if (!dataUri.startsWith('data:text/html;base64,')) {
  throw new Error(`Data URI failed: ${dataUri}`);
}

const htmlInput = '<h1>Title</h1><p>This is <strong>bold</strong> and <em>italic</em>.</p><a href="https://toolstrum.app">Link</a>';
const md = htmlToMarkdown(htmlInput);
if (!md.includes('# Title') || !md.includes('**bold**') || !md.includes('*italic*') || !md.includes('[Link](https://toolstrum.app)')) {
  throw new Error(`HTML to Markdown conversion failed: ${md}`);
}

const contentStats = analyzeWebpageContent('<p>Fast offline tools for developers and creators. Offline tools protect privacy.</p>');
if (contentStats.wordCount < 8 || contentStats.topKeywords.length === 0) {
  throw new Error(`Content word counter failed: ${JSON.stringify(contentStats)}`);
}
console.log('✔ HTML and Content operations validated.');

console.log('--- ALL WEB & INTERNET STUDIO TESTS PASSED (100%) ---');
