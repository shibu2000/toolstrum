export type WebWorkspaceId =
  | 'web_url_links'
  | 'web_meta_seo'
  | 'web_network_inspector'
  | 'web_html_content';

export interface WebToolConfig {
  id: number;
  workspaceId: WebWorkspaceId;
  title: string;
  subtitle: string;
  mode: string;
  description: string;
  iconName: string;
}

export const WEB_TOOLS_CONFIG: Record<number, WebToolConfig> = {
  // --- Workspace 1: web_url_links (6 tools) ---
  376: {
    id: 376,
    workspaceId: 'web_url_links',
    title: 'URL Shortener',
    subtitle: 'Web & Internet Utilities',
    mode: 'url_shorten',
    description: 'Create compact offline short URL aliases with customizable keys and hash digests.',
    iconName: 'Link2',
  },
  377: {
    id: 377,
    workspaceId: 'web_url_links',
    title: 'URL Expander',
    subtitle: 'Web & Internet Utilities',
    mode: 'url_expand',
    description: 'Unpack shortened URLs, inspect redirect chains, and reveal final landing targets.',
    iconName: 'Maximize2',
  },
  378: {
    id: 378,
    workspaceId: 'web_url_links',
    title: 'Website QR Generator',
    subtitle: 'Web & Internet Utilities',
    mode: 'url_qr',
    description: 'Generate high-density scannable QR matrices specifically optimized for website links.',
    iconName: 'QrCode',
  },
  392: {
    id: 392,
    workspaceId: 'web_url_links',
    title: 'Link Extractor',
    subtitle: 'Web & Internet Utilities',
    mode: 'link_extract',
    description: 'Parse raw HTML documents to extract, categorize, and deduplicate hyperlinks and anchors.',
    iconName: 'ExternalLink',
  },
  395: {
    id: 395,
    workspaceId: 'web_url_links',
    title: 'URL Validator',
    subtitle: 'Web & Internet Utilities',
    mode: 'url_validate',
    description: 'Verify RFC 3986 URL syntax, protocols, domain labels, ports, and query structures.',
    iconName: 'CheckCircle2',
  },
  397: {
    id: 397,
    workspaceId: 'web_url_links',
    title: 'QR Link Preview',
    subtitle: 'Web & Internet Utilities',
    mode: 'qr_preview',
    description: 'Safely inspect QR code destinations, host reputation, and tracking payloads.',
    iconName: 'Eye',
  },

  // --- Workspace 2: web_meta_seo (6 tools) ---
  379: {
    id: 379,
    workspaceId: 'web_meta_seo',
    title: 'Website Metadata Viewer',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'meta_viewer',
    description: 'Parse HTML headers for titles, canonical tags, viewports, charsets, and meta keywords.',
    iconName: 'FileSearch',
  },
  381: {
    id: 381,
    workspaceId: 'web_meta_seo',
    title: 'Open Graph Preview',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'og_preview',
    description: 'Simulate rich social preview cards across Twitter/X, Facebook, and LinkedIn.',
    iconName: 'Share2',
  },
  382: {
    id: 382,
    workspaceId: 'web_meta_seo',
    title: 'Robots.txt Viewer',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'robots_view',
    description: 'Analyze crawl directives, disallow paths, user-agents, and sitemap pointers.',
    iconName: 'Bot',
  },
  383: {
    id: 383,
    workspaceId: 'web_meta_seo',
    title: 'Sitemap Viewer',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'sitemap_view',
    description: 'Inspect XML sitemaps, extracting URL locations, change frequencies, and priorities.',
    iconName: 'Compass',
  },
  393: {
    id: 393,
    workspaceId: 'web_meta_seo',
    title: 'Meta Tag Generator',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'meta_generator',
    description: 'Generate standard SEO, Open Graph, and Twitter card HTML header tags.',
    iconName: 'Code2',
  },
  394: {
    id: 394,
    workspaceId: 'web_meta_seo',
    title: 'Sitemap Generator',
    subtitle: 'SEO & Metadata Utilities',
    mode: 'sitemap_generator',
    description: 'Compile valid XML sitemaps conforming to sitemaps.org standards from URL lists.',
    iconName: 'FilePlus2',
  },

  // --- Workspace 3: web_network_inspector (7 tools) ---
  384: {
    id: 384,
    workspaceId: 'web_network_inspector',
    title: 'DNS Lookup',
    subtitle: 'Network & Diagnostics',
    mode: 'dns_lookup',
    description: 'Inspect simulated and standard DNS records (A, AAAA, CNAME, MX, TXT, NS).',
    iconName: 'Server',
  },
  385: {
    id: 385,
    workspaceId: 'web_network_inspector',
    title: 'Public IP Checker',
    subtitle: 'Network & Diagnostics',
    mode: 'ip_checker',
    description: 'Analyze IP address format, private vs public scope, and loopback classifications.',
    iconName: 'Activity',
  },
  386: {
    id: 386,
    workspaceId: 'web_network_inspector',
    title: 'IP Information Lookup',
    subtitle: 'Network & Diagnostics',
    mode: 'ip_lookup',
    description: 'Calculate subnet masks, CIDR blocks, usable IP host ranges, and network addresses.',
    iconName: 'Globe',
  },
  387: {
    id: 387,
    workspaceId: 'web_network_inspector',
    title: 'Internet Speed Test',
    subtitle: 'Network & Diagnostics',
    mode: 'speed_test',
    description: 'Run offline synthetic bandwidth calculations estimating download, upload, and latency.',
    iconName: 'Gauge',
  },
  388: {
    id: 388,
    workspaceId: 'web_network_inspector',
    title: 'Network Latency Checker',
    subtitle: 'Network & Diagnostics',
    mode: 'latency_checker',
    description: 'Benchmark round-trip ping times, packet jitter, and transmission stability.',
    iconName: 'Timer',
  },
  389: {
    id: 389,
    workspaceId: 'web_network_inspector',
    title: 'HTTP Header Inspector',
    subtitle: 'Network & Diagnostics',
    mode: 'header_inspector',
    description: 'Inspect HTTP response headers, caching directives, and security configurations (CSP, HSTS).',
    iconName: 'ShieldAlert',
  },
  391: {
    id: 391,
    workspaceId: 'web_network_inspector',
    title: 'Website Availability Checker',
    subtitle: 'Network & Diagnostics',
    mode: 'availability_checker',
    description: 'Assess server HTTP status codes, DNS resolution state, and uptime availability.',
    iconName: 'CheckSquare',
  },

  // --- Workspace 4: web_html_content (6 tools) ---
  380: {
    id: 380,
    workspaceId: 'web_html_content',
    title: 'HTML Previewer',
    subtitle: 'Content & Formatting',
    mode: 'html_preview',
    description: 'Render and preview custom HTML markups, CSS styles, and typography in real-time.',
    iconName: 'Eye',
  },
  390: {
    id: 390,
    workspaceId: 'web_html_content',
    title: 'SSL Certificate Checker',
    subtitle: 'Content & Formatting',
    mode: 'ssl_checker',
    description: 'Inspect SSL/TLS certificate validity, issuer, SAN domains, and expiration countdowns.',
    iconName: 'Lock',
  },
  396: {
    id: 396,
    workspaceId: 'web_html_content',
    title: 'Data URI Generator',
    subtitle: 'Content & Formatting',
    mode: 'data_uri',
    description: 'Convert HTML, SVG, text, or CSS into inline Base64 data URIs (RFC 2397).',
    iconName: 'Binary',
  },
  398: {
    id: 398,
    workspaceId: 'web_html_content',
    title: 'Webpage Screenshot',
    subtitle: 'Content & Formatting',
    mode: 'screenshot_mock',
    description: 'Generate simulated browser viewport screenshots and viewport dimension mockups.',
    iconName: 'Monitor',
  },
  399: {
    id: 399,
    workspaceId: 'web_html_content',
    title: 'Webpage to Markdown',
    subtitle: 'Content & Formatting',
    mode: 'html_to_markdown',
    description: 'Strip HTML scripts, styles, and boilerplate to extract clean formatted Markdown.',
    iconName: 'FileCode',
  },
  400: {
    id: 400,
    workspaceId: 'web_html_content',
    title: 'Website Word Counter',
    subtitle: 'Content & Formatting',
    mode: 'word_counter',
    description: 'Analyze webpage content lexical density, word count, reading time, and top keywords.',
    iconName: 'FileText',
  },
};

export function getWebToolConfig(toolId: number): WebToolConfig | undefined {
  return WEB_TOOLS_CONFIG[toolId];
}
