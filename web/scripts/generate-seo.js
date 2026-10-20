import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const SITE_URL = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://toolstrum.vercel.app'
).replace(/\/$/, '');

const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getToolSlug = (tool) => `${tool.id}-${slugify(tool.name)}`;

const getHowToSteps = (tool) => {
  if (tool.inputKind === 'file') {
    return [
      {
        name: 'Drop or Select Your File',
        text: `Open ${tool.name} and drag & drop your file into the secure drop zone. Your file is loaded directly into browser memory and never uploaded to any cloud server.`,
      },
      {
        name: 'Configure Processing Options',
        text: `Customize output preferences, parameters, or compression settings to suit your project requirements.`,
      },
      {
        name: 'Process & Download Instantly',
        text: `Click execute to run locally on your device CPU. Download your completed file immediately with zero server latency.`,
      },
    ];
  }

  if (tool.inputKind === 'text' || tool.inputKind === 'code') {
    return [
      {
        name: 'Paste or Enter Input Content',
        text: `Paste your text, code, or payload into the ${tool.name} input editor.`,
      },
      {
        name: 'Apply Local Transformation',
        text: `Select formatting rules, encodings, or parameters. Transformations run instantly in real-time.`,
      },
      {
        name: 'Copy Output or Export',
        text: `Copy your processed result directly to your clipboard with a single click or save it to a file.`,
      },
    ];
  }

  return [
    {
      name: 'Enter Parameters',
      text: `Fill in the required inputs and preferences into ${tool.name}.`,
    },
    {
      name: 'Review Diagnostics & Results',
      text: `Diagnostics and computed results update in real-time with sub-millisecond local precision.`,
    },
    {
      name: 'Save or Share',
      text: `Copy the calculated metrics or download the output report.`,
    },
  ];
};

const getCategoryFaqs = (tool, studio) => {
  const common = [
    {
      question: `Is ${tool.name} 100% free with no limits?`,
      answer: `Yes! Toolstrum is completely free forever. There are no subscriptions, paywalls, watermark restrictions, or hidden usage limits.`,
    },
    {
      question: `How does Toolstrum protect my personal data and privacy?`,
      answer: `Toolstrum is built with an offline-first, client-side architecture. All computations run in-memory inside your browser using WebAssembly and HTML5 Canvas. Zero bytes are ever sent to remote servers.`,
    },
  ];

  let specific = [];

  switch (studio.id) {
    case 'pdf':
      specific = [
        {
          question: `Does ${tool.name} upload my PDF files to a remote server?`,
          answer: `No. Unlike traditional cloud PDF converters, Toolstrum parses, transforms, and exports PDFs entirely inside your browser memory using client-side WebAssembly. Your files never leave your computer.`,
        },
        {
          question: `Can I process confidential legal contracts or bank statements?`,
          answer: `Yes, absolutely. Because the entire processing lifecycle is 100% air-gapped and runs locally inside your browser sandbox, it is safe for confidential and sensitive documents.`,
        },
        {
          question: `Is there a maximum file size limit for ${tool.name}?`,
          answer: `Toolstrum does not enforce artificial server limits. Your maximum file capacity is bounded only by your device's available RAM.`,
        },
      ];
      break;

    case 'image':
    case 'scanner':
      specific = [
        {
          question: `Does ${tool.name} degrade picture quality?`,
          answer: `Toolstrum utilizes native HTML5 Canvas rendering and high-precision encoding algorithms to preserve optimal visual clarity while executing transformations.`,
        },
        {
          question: `Are my private photos or camera scans uploaded anywhere?`,
          answer: `Never. Toolstrum has zero cloud databases or background telemetry. Once you close or reload the browser tab, all processed pixels are cleared from local RAM.`,
        },
      ];
      break;

    case 'developer':
    case 'qr_security':
      specific = [
        {
          question: `Are sensitive tokens, API keys, or passwords secure with ${tool.name}?`,
          answer: `Yes. All hashes, encodings, QR generators, and formatters execute via Web Crypto (SubtleCrypto) directly on your local CPU. No strings are ever transmitted over the network.`,
        },
        {
          question: `Does ${tool.name} work completely offline without internet?`,
          answer: `Yes. Once the web application loads into your browser, all utilities operate without needing an active Wi-Fi or cellular network connection.`,
        },
      ];
      break;

    case 'calculators':
      specific = [
        {
          question: `How accurate are calculations computed by ${tool.name}?`,
          answer: `Calculations are computed using high-precision IEEE 754 floating point arithmetic and industry-standard mathematical formulas to ensure dependable financial and scientific accuracy.`,
        },
      ];
      break;

    default:
      specific = [
        {
          question: `Do I need to install any browser extensions or software?`,
          answer: `No installation required. ${tool.name} runs instantly in any modern web browser including Chrome, Firefox, Safari, Edge, and mobile browsers.`,
        },
      ];
      break;
  }

  return [...specific, ...common];
};

const run = async () => {
  console.log('🚀 Starting Toolstrum SEO & Static Pre-Rendering Engine...');

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  // Read webRegistry.ts to extract tools and studios
  const registryContent = fs.readFileSync(path.join(rootDir, 'src/data/webRegistry.ts'), 'utf8');

  // Extract WEB_TOOLS JSON
  const toolsStart = registryContent.indexOf('export const WEB_TOOLS: ToolDefinition[] = [');
  const toolsEnd = registryContent.indexOf('];\n\nexport function getToolById');
  const toolsJsonStr = registryContent.substring(
    toolsStart + 'export const WEB_TOOLS: ToolDefinition[] = '.length,
    toolsEnd + 1
  );
  const tools = JSON.parse(toolsJsonStr);

  const studios = [
    { id: 'pdf', name: 'PDF Studio', description: 'Merge, split, reorder, compress, sign, and convert PDF documents offline.' },
    { id: 'image', name: 'Image Studio', description: 'Compress, crop, resize, convert formats, filter, and extract colors from images.' },
    { id: 'scanner', name: 'Document Scanner', description: 'Webcam capture, perspective cleanup, high-contrast B&W filters, and scan-to-PDF.' },
    { id: 'video', name: 'Video Studio', description: 'Frame extraction, video-to-audio, subtitle editing, and stream slicing in browser.' },
    { id: 'audio', name: 'Audio Studio', description: 'Web Audio trimmer, waveforms, text-to-speech, decibel meter, and sound recorder.' },
    { id: 'office', name: 'Office & Documents', description: 'CSV editor/viewer, JSON-to-CSV, spreadsheet generator, and Markdown live editor.' },
    { id: 'archive', name: 'Archive & Files', description: 'Create and extract ZIP archives, inspect contents, and generate file checksums.' },
    { id: 'text', name: 'Text & Writing', description: 'Word counters, case conversion, line sorters, diff comparison, and slug tools.' },
    { id: 'developer', name: 'Developer Tools', description: 'JSON/YAML formatters, JWT inspector, Regex tester, CSS playgrounds, and crypto hashes.' },
    { id: 'calculators', name: 'Calculators', description: 'Financial EMI & loans, unit converters, scientific math, and date/time calculators.' },
    { id: 'qr_security', name: 'QR, Barcode & Security', description: 'Custom QR generator, barcode maker, password entropy meter, and TOTP 2FA.' },
    { id: 'web', name: 'Web & Internet', description: 'URL parser, UTM campaign tagger, meta tag generator, and HTTP header inspector.' },
    { id: 'ai', name: 'AI Studio', description: 'Client-side offline smart assistant & preview tools (Coming in V2).' },
    { id: 'productivity', name: 'Productivity & Education', description: 'Pomodoro timer with audio alerts, expense splitter, invoice generator, and resume maker.' },
    { id: 'accessibility', name: 'Accessibility & Display', description: 'WCAG contrast checker, color blindness simulator, font scaler, and screen metrics.' },
    { id: 'advanced', name: 'Advanced & Experimental', description: 'Air-gapped QR streamer, perceptual image hashing, CSV charts, and PII redactor.' },
  ];

  console.log(`📦 Loaded ${tools.length} tools and ${studios.length} studios for pre-rendering.`);

  const sitemapUrls = [
    { url: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
  ];

  // Helper to replace or inject tags in baseHtml
  const createSeoHtml = ({ title, description, keywords, pathUrl, schemaGraph, staticBody }) => {
    let html = baseHtml;

    // Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

    // Meta Description
    html = html.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${description}" />`
    );

    // Canonical & Social & Schema Tags
    const headInjections = `
    <link rel="canonical" href="${SITE_URL}${pathUrl}" />
    <meta name="keywords" content="${keywords || 'free online tools, offline utilities, toolstrum'}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Toolstrum" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${SITE_URL}${pathUrl}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <script type="application/ld+json">
      ${JSON.stringify(schemaGraph, null, 2)}
    </script>
  </head>`;

    html = html.replace('</head>', headInjections);

    // Inject semantic crawlable HTML inside #root
    if (staticBody) {
      html = html.replace(
        '<div id="root"></div>',
        `<div id="root">${staticBody}</div>`
      );
    }

    return html;
  };

  // 1. Generate Static Homepage (dist/index.html)
  const offlineToolCount = tools.filter((t) => t.offlineCapable && t.status === 'available').length;
  const homeTitle = `Toolstrum — ${offlineToolCount}+ Free Online Tools | 100% Client-Side & Private (No Uploads)`;
  const homeDesc = `${offlineToolCount}+ free offline tools in one unified browser workspace. Convert PDFs, edit images, test regex, calculate finances, and generate QR codes with zero cloud uploads.`;
  const homeKeywords = 'free online tools, offline pdf tools, image converter, developer tools, calculators, regex tester, qr generator, client-side tools, toolstrum';

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Toolstrum',
        url: `${SITE_URL}/`,
        description: homeDesc,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Toolstrum',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/favicon.svg`,
      },
    ],
  };

  const homeBody = `
    <header style="padding:1.5rem;border-bottom:1px solid #e2e8f0;background:#ffffff;">
      <nav style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
        <a href="/" style="font-weight:800;font-size:1.25rem;color:#0f172a;text-decoration:none;display:flex;align-items:center;gap:0.75rem;">
          <img src="/favicon.svg" width="36" height="36" alt="Toolstrum Logo" style="border-radius:10px;" />
          <span>Toolstrum</span>
        </a>
        <div style="font-size:0.875rem;color:#64748b;">100% Client-Side • Zero Cloud Upload • Instant Processing</div>
      </nav>
    </header>
    <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,-apple-system,sans-serif;">
      <section style="margin-bottom:3rem;text-align:center;">
        <h1 style="font-size:2.5rem;font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:1rem;">Your Everyday Toolkit — ${offlineToolCount}+ Free Offline Tools</h1>
        <p style="font-size:1.125rem;color:#475569;max-width:700px;margin:0 auto 1.5rem auto;">
          The private, client-side alternative to traditional online converters. Merge PDFs, edit images, format code, and compute finances with zero data leaks.
        </p>
      </section>

      <section style="margin-bottom:3rem;">
        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">Specialized Studios</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
          ${studios.map(s => `
            <a href="/studio/${s.id}" style="padding:1.25rem;border:1px solid #e2e8f0;border-radius:1rem;text-decoration:none;color:inherit;background:#ffffff;display:block;">
              <h3 style="font-size:1.125rem;font-weight:600;color:#1e293b;margin:0 0 0.5rem 0;">${s.name}</h3>
              <p style="font-size:0.875rem;color:#64748b;margin:0;">${s.description}</p>
            </a>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:3rem;">
        <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">Popular Tools</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
          ${tools.filter(t => t.isPopular).slice(0, 16).map(t => {
            const slug = getToolSlug(t);
            return `
              <a href="/tool/${slug}" style="padding:1rem;border:1px solid #e2e8f0;border-radius:0.75rem;text-decoration:none;color:inherit;background:#ffffff;display:block;">
                <span style="font-size:0.75rem;color:#6366f1;font-weight:600;">#${t.id}</span>
                <h4 style="font-size:1rem;font-weight:600;color:#0f172a;margin:0.25rem 0;">${t.name}</h4>
                <p style="font-size:0.8125rem;color:#64748b;margin:0;">${t.description}</p>
              </a>
            `;
          }).join('')}
        </div>
      </section>
    </main>
  `;

  const homeHtml = createSeoHtml({
    title: homeTitle,
    description: homeDesc,
    keywords: homeKeywords,
    pathUrl: '',
    schemaGraph: homeSchema,
    staticBody: homeBody,
  });
  fs.writeFileSync(templatePath, homeHtml);

  // 2. Generate Static Pages for Studios
  studios.forEach((studio) => {
    const studioUrlPath = `/studio/${studio.id}`;
    const toolsInStudio = tools.filter((t) => t.studioId === studio.id);
    const title = `${studio.name} — Free Online Utilities (100% In-Browser & Private) | Toolstrum`;
    const description = `Explore ${toolsInStudio.length} free ${studio.name} utilities. ${studio.description} 100% client-side execution with zero cloud uploads or tracking.`;
    const keywords = `${studio.name.toLowerCase()}, free online ${studio.name.toLowerCase()}, offline tools, client side utilities, toolstrum`;

    const studioFaqs = [
      {
        question: `What tools are included in ${studio.name}?`,
        answer: `${studio.name} offers ${toolsInStudio.length} dedicated tools for everyday productivity, including ${studio.description}`,
      },
      {
        question: `Are ${studio.name} tools safe for sensitive confidential files?`,
        answer: `Yes! Every utility runs in-memory inside your local web browser. No files, code, or data are ever transmitted to external cloud servers.`,
      },
      {
        question: `Can I use ${studio.name} offline without an internet connection?`,
        answer: `Yes. Once loaded, all client-side operations run locally on your device without needing ongoing network connectivity.`,
      },
    ];

    const breadcrumbs = [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: studio.name, url: `${SITE_URL}${studioUrlPath}` },
    ];

    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${SITE_URL}${studioUrlPath}#collection`,
          name: `${studio.name} - Toolstrum`,
          description,
          url: `${SITE_URL}${studioUrlPath}`,
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${SITE_URL}${studioUrlPath}#breadcrumb`,
          itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        },
        {
          '@type': 'FAQPage',
          '@id': `${SITE_URL}${studioUrlPath}#faq`,
          mainEntity: studioFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };

    const staticBody = `
      <nav aria-label="Breadcrumb" style="margin-bottom:1rem;font-size:0.875rem;color:#64748b;">
        <a href="/" style="color:#4f46e5;text-decoration:none;">Home</a> / <span>${studio.name}</span>
      </nav>
      <header style="margin-bottom:2rem;">
        <h1 style="font-size:2rem;font-weight:800;color:#0f172a;margin-bottom:0.5rem;">${studio.name}</h1>
        <p style="font-size:1rem;color:#475569;max-width:800px;line-height:1.6;">${studio.description}</p>
        <p style="font-size:0.875rem;color:#059669;font-weight:600;margin-top:0.5rem;">100% In-Browser Execution • Zero File Uploads • Offline Ready</p>
      </header>

      <section style="margin-bottom:3rem;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">All ${toolsInStudio.length} Tools in ${studio.name}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;">
          ${toolsInStudio.map(t => {
            const slug = getToolSlug(t);
            return `
              <a href="/tool/${slug}" style="padding:1.25rem;border:1px solid #e2e8f0;border-radius:1rem;text-decoration:none;color:inherit;background:#ffffff;display:block;">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                  <span style="font-size:0.75rem;color:#6366f1;font-weight:700;font-family:monospace;">#${t.id}</span>
                  <span style="font-size:0.75rem;color:#059669;font-weight:600;">Offline</span>
                </div>
                <h3 style="font-size:1rem;font-weight:600;color:#0f172a;margin:0 0 0.5rem 0;">${t.name}</h3>
                <p style="font-size:0.8125rem;color:#64748b;margin:0;line-height:1.5;">${t.description}</p>
              </a>
            `;
          }).join('')}
        </div>
      </section>

      <section style="margin-bottom:3rem;padding:1.5rem;border:1px solid #e2e8f0;border-radius:1rem;background:#f8fafc;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">Frequently Asked Questions</h2>
        ${studioFaqs.map(f => `
          <div style="margin-bottom:1rem;">
            <h3 style="font-size:0.95rem;font-weight:600;color:#1e293b;margin-bottom:0.25rem;">${f.question}</h3>
            <p style="font-size:0.875rem;color:#475569;line-height:1.5;margin:0;">${f.answer}</p>
          </div>
        `).join('')}
      </section>
    `;

    const html = createSeoHtml({
      title,
      description,
      keywords,
      pathUrl: studioUrlPath,
      schemaGraph,
      staticBody,
    });

    const targetDir = path.join(distDir, 'studio', studio.id);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);

    sitemapUrls.push({
      url: `${SITE_URL}${studioUrlPath}`,
      priority: '0.9',
      changefreq: 'weekly',
    });
  });

  // 3. Generate Static Pages for all 495 Tools
  tools.forEach((tool) => {
    const slug = getToolSlug(tool);
    const toolUrlPath = `/tool/${slug}`;
    const studio = studios.find((s) => s.id === tool.studioId) || { id: tool.studioId, name: 'Utility Studio', description: 'Utilities' };
    const title = `Free Online ${tool.name} (100% In-Browser & Private) | Toolstrum`;
    const description = `Use ${tool.name} online for free. ${tool.description} Fast, secure in-browser processing with zero file uploads, no watermarks, and complete privacy.`;
    const keywords = `${tool.name.toLowerCase()}, free online ${tool.name.toLowerCase()}, offline ${tool.name.toLowerCase()}, client side ${tool.name.toLowerCase()}, ${studio.name.toLowerCase()}, toolstrum`;

    const howToSteps = getHowToSteps(tool);
    const faqs = getCategoryFaqs(tool, studio);
    const relatedTools = tools.filter((t) => t.studioId === tool.studioId && t.id !== tool.id).slice(0, 6);

    const breadcrumbs = [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: studio.name, url: `${SITE_URL}/studio/${studio.id}` },
      { name: tool.name, url: `${SITE_URL}${toolUrlPath}` },
    ];

    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${SITE_URL}${toolUrlPath}#webapp`,
          name: tool.name,
          url: `${SITE_URL}${toolUrlPath}`,
          description: tool.description,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'All (Web Browser)',
          browserRequirements: 'Requires JavaScript. Requires HTML5.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            '100% Client-Side In-Memory Processing',
            'Zero Server File Uploads',
            'Offline Capable Execution',
            'Unlimited & Free',
          ],
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${SITE_URL}${toolUrlPath}#breadcrumb`,
          itemListElement: breadcrumbs.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            item: crumb.url,
          })),
        },
        {
          '@type': 'HowTo',
          '@id': `${SITE_URL}${toolUrlPath}#howto`,
          name: `How to use ${tool.name}`,
          description: `Step-by-step guide on how to use ${tool.name} online for free and offline.`,
          step: howToSteps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.name,
            text: step.text,
          })),
        },
        {
          '@type': 'FAQPage',
          '@id': `${SITE_URL}${toolUrlPath}#faq`,
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };

    const staticBody = `
      <nav aria-label="Breadcrumb" style="margin-bottom:1rem;font-size:0.875rem;color:#64748b;">
        <a href="/" style="color:#4f46e5;text-decoration:none;">Home</a> /
        <a href="/studio/${studio.id}" style="color:#4f46e5;text-decoration:none;">${studio.name}</a> /
        <span>${tool.name}</span>
      </nav>

      <header style="margin-bottom:2rem;">
        <div style="font-size:0.875rem;font-family:monospace;color:#6366f1;font-weight:700;margin-bottom:0.25rem;">TOOL #${tool.id} • ${studio.name.toUpperCase()}</div>
        <h1 style="font-size:2.25rem;font-weight:800;color:#0f172a;margin-bottom:0.75rem;line-height:1.2;">${tool.name}</h1>
        <p style="font-size:1.125rem;color:#475569;max-width:800px;line-height:1.6;">${tool.description}</p>
        <div style="margin-top:1rem;display:inline-flex;gap:1rem;font-size:0.875rem;color:#059669;font-weight:600;">
          <span>✓ 100% In-Browser Privacy</span>
          <span>✓ Zero Cloud Upload</span>
          <span>✓ Free & Unlimited</span>
        </div>
      </header>

      <section style="margin-bottom:2.5rem;padding:1.5rem;border:1px solid #e2e8f0;border-radius:1rem;background:#ffffff;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">How to Use ${tool.name}</h2>
        <ol style="padding-left:1.25rem;margin:0;line-height:1.8;color:#334155;">
          ${howToSteps.map(s => `
            <li style="margin-bottom:0.75rem;">
              <strong>${s.name}:</strong> ${s.text}
            </li>
          `).join('')}
        </ol>
      </section>

      <section style="margin-bottom:2.5rem;padding:1.5rem;border:1px solid #10b98133;border-radius:1rem;background:#10b9810d;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem;color:#065f46;">100% Client-Side Privacy Guarantee</h2>
        <p style="font-size:0.875rem;color:#1e293b;line-height:1.6;margin:0;">
          Unlike traditional utility websites that upload your files or text to remote servers, Toolstrum operates entirely inside your web browser. All file processing, cryptographic hashing, and format conversions are executed locally on your device via WebAssembly and Canvas. Zero bytes are ever sent over the network.
        </p>
      </section>

      <section style="margin-bottom:2.5rem;padding:1.5rem;border:1px solid #e2e8f0;border-radius:1rem;background:#f8fafc;">
        <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">Frequently Asked Questions</h2>
        ${faqs.map(f => `
          <div style="margin-bottom:1rem;">
            <h3 style="font-size:0.95rem;font-weight:600;color:#1e293b;margin-bottom:0.25rem;">${f.question}</h3>
            <p style="font-size:0.875rem;color:#475569;line-height:1.5;margin:0;">${f.answer}</p>
          </div>
        `).join('')}
      </section>

      ${relatedTools.length > 0 ? `
        <section style="margin-bottom:3rem;">
          <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:#0f172a;">Related Tools in ${studio.name}</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;">
            ${relatedTools.map(rel => {
              const relSlug = getToolSlug(rel);
              return `
                <a href="/tool/${relSlug}" style="padding:1rem;border:1px solid #e2e8f0;border-radius:0.75rem;text-decoration:none;color:inherit;background:#ffffff;display:block;">
                  <span style="font-size:0.75rem;color:#6366f1;font-weight:700;font-family:monospace;">#${rel.id}</span>
                  <h4 style="font-size:0.95rem;font-weight:600;color:#0f172a;margin:0.25rem 0;">${rel.name}</h4>
                  <p style="font-size:0.8125rem;color:#64748b;margin:0;">${rel.description}</p>
                </a>
              `;
            }).join('')}
          </div>
        </section>
      ` : ''}
    `;

    const html = createSeoHtml({
      title,
      description,
      keywords,
      pathUrl: toolUrlPath,
      schemaGraph,
      staticBody,
    });

    // Write to /tool/<id-slug>/index.html
    const targetDir = path.join(distDir, 'tool', slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), html);

    // Also write alias to /tool/<id>/index.html for direct ID navigation
    const targetDirId = path.join(distDir, 'tool', String(tool.id));
    fs.mkdirSync(targetDirId, { recursive: true });
    fs.writeFileSync(path.join(targetDirId, 'index.html'), html);

    sitemapUrls.push({
      url: `${SITE_URL}${toolUrlPath}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  });

  // 4. Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
  console.log(`✅ sitemap.xml generated with ${sitemapUrls.length} crawlable URLs.`);

  // 5. Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt);
  console.log('✅ robots.txt generated.');

  console.log(`🎉 Static SEO pre-rendering complete! Generated ${tools.length * 2 + studios.length + 1} static HTML pages in dist/.`);
};

run().catch((err) => {
  console.error('Fatal error during SEO pre-rendering:', err);
  process.exit(1);
});
