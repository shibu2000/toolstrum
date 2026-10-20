import { ToolDefinition, StudioDefinition } from '../types';
import { getToolSlug, SITE_URL } from './seo';
import { OFFLINE_TOOL_COUNT } from '../data/webRegistry';

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoStepItem {
  name: string;
  text: string;
}

export interface ToolSeoData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  howToSteps: SeoStepItem[];
  faqs: SeoFaqItem[];
  features: { title: string; desc: string }[];
  breadcrumbs: { name: string; url: string }[];
  schemaGraph: object;
}

export interface StudioSeoData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  faqs: SeoFaqItem[];
  breadcrumbs: { name: string; url: string }[];
  schemaGraph: object;
}

/**
 * Returns dynamic, keyword-optimized SEO metadata, FAQs, and schemas for any tool.
 */
export function getToolSeoData(
  tool: ToolDefinition,
  studio: StudioDefinition,
  siteUrl = SITE_URL
): ToolSeoData {
  const slug = getToolSlug(tool);
  const toolUrl = `${siteUrl}/tool/${slug}`;
  const studioUrl = `${siteUrl}/studio/${studio.id}`;

  const title = `Free Online ${tool.name} (100% Offline & 100% Secure) | Toolstrum`;
  const description = `Use ${tool.name} online for free. ${tool.description} Fast, 100% offline processing directly on your device with zero file uploads, no watermarks, and complete privacy.`;

  const keywords = [
    tool.name.toLowerCase(),
    `free online ${tool.name.toLowerCase()}`,
    `offline ${tool.name.toLowerCase()}`,
    `${studio.name.toLowerCase()}`,
    'offline tool',
    'no file upload',
    'private web tools',
    'toolstrum',
  ].join(', ');

  // Steps based on input kind
  let howToSteps: SeoStepItem[] = [
    {
      name: 'Input Data or Select File',
      text: `Open ${tool.name} and drag & drop your source file or enter your data into the editor.`,
    },
    {
      name: 'Configure Options & Preview',
      text: 'Adjust your preferred parameters, formatting settings, or preview the real-time output.',
    },
    {
      name: 'Execute & Save Result',
      text: 'Process locally in your browser memory and instantly copy or download the finished result.',
    },
  ];

  if (tool.inputKind === 'file' || tool.inputKind === 'files') {
    howToSteps = [
      {
        name: 'Drop Your File',
        text: `Select or drop your file into the secure ${tool.name} workspace. Your file never leaves your computer.`,
      },
      {
        name: 'Customize Settings',
        text: 'Choose your desired output format, compression ratio, or transformation parameters.',
      },
      {
        name: 'Instant Download',
        text: 'Click Process to generate your resulting file in memory and download it directly with zero server delay.',
      },
    ];
  } else if (tool.inputKind === 'text') {
    howToSteps = [
      {
        name: 'Paste or Type Content',
        text: `Paste your text or code snippet into the ${tool.name} input area.`,
      },
      {
        name: 'Apply Transformation',
        text: 'Select your target options, encodings, or formatting rules to transform your content.',
      },
      {
        name: 'Copy or Export',
        text: 'Copy the transformed output directly to your clipboard with one click or export to a file.',
      },
    ];
  }

  // Domain-specific FAQs
  let categoryFaqs: SeoFaqItem[] = [];

  switch (studio.id) {
    case 'pdf':
      categoryFaqs = [
        {
          question: `Does ${tool.name} upload my PDF files to a remote server?`,
          answer: `No. Unlike cloud-based PDF services, Toolstrum processes all PDF operations directly on your device. Your files never touch any external server.`,
        },
        {
          question: `Can I use ${tool.name} for confidential documents and bank statements?`,
          answer: `Yes, absolutely. Because the entire processing lifecycle is 100% offline and runs directly on your device, it is fully compliant with strict privacy and data confidentiality requirements.`,
        },
        {
          question: `Is there a maximum file size limit for ${tool.name}?`,
          answer: `Toolstrum does not enforce artificial server limits. All operations run directly on your device.`,
        },
      ];
      break;

    case 'image':
    case 'scanner':
      categoryFaqs = [
        {
          question: `Does ${tool.name} reduce image quality?`,
          answer: `Toolstrum uses high-fidelity offline processing algorithms to preserve optimal visual clarity while executing your requested transformations.`,
        },
        {
          question: `Are my uploaded images or webcam scans stored anywhere?`,
          answer: `Never. Toolstrum has zero cloud databases or servers. All processed files stay 100% private on your own device.`,
        },
      ];
      break;

    case 'developer':
    case 'qr_security':
      categoryFaqs = [
        {
          question: `Are API keys, tokens, or passwords safe with ${tool.name}?`,
          answer: `Yes. All hashes, encodings, QR generation, and formatters utilize Web Crypto (SubtleCrypto) running completely on your local CPU. No credentials or strings are ever logged or transmitted.`,
        },
        {
          question: `Does ${tool.name} work completely offline without an internet connection?`,
          answer: `Yes. Once Toolstrum is loaded into your browser, all utilities can execute even when your device is fully disconnected from Wi-Fi or cellular networks.`,
        },
      ];
      break;

    case 'calculators':
      categoryFaqs = [
        {
          question: `How accurate are calculations produced by ${tool.name}?`,
          answer: `Calculations are computed using high-precision IEEE 754 floating point arithmetic and industry-standard mathematical formulas to ensure dependable financial and scientific accuracy.`,
        },
      ];
      break;

    default:
      categoryFaqs = [
        {
          question: `Is ${tool.name} completely free to use?`,
          answer: `Yes. Toolstrum is 100% free with no subscriptions, paywalls, ads, watermarks, or account registration required.`,
        },
        {
          question: `Do I need to install any browser extensions or software?`,
          answer: `No installation required. ${tool.name} runs out of the box in any modern browser including Chrome, Firefox, Safari, Edge, and mobile browsers.`,
        },
      ];
      break;
  }

  // Base universal FAQs
  const universalFaqs: SeoFaqItem[] = [
    {
      question: `Is ${tool.name} free with no limits?`,
      answer: `Yes! Toolstrum is completely free with no usage quotas, watermark restrictions, or hidden fees.`,
    },
    {
      question: `How does Toolstrum protect my personal privacy?`,
      answer: `Toolstrum is built on a 100% offline, privacy-first architecture. All computations run directly inside your browser on your device without any server file uploads or tracking.`,
    },
  ];

  const faqs = [...categoryFaqs, ...universalFaqs];

  const features = [
    {
      title: '100% Offline & 100% Secure',
      desc: 'All operations execute locally on your device. Zero file bytes or inputs leave your device.',
    },
    {
      title: 'Zero Latency & Sub-Millisecond Speed',
      desc: 'No uploading or downloading delays over the network. Processing finishes in milliseconds.',
    },
    {
      title: 'Complete Device Privacy & Confidentiality',
      desc: 'Completely safe for proprietary source code, confidential financial records, and private documents.',
    },
    {
      title: 'No Sign-Up or Subscription',
      desc: 'Instant unlimited access without requiring email addresses, accounts, or payment details.',
    },
  ];

  const breadcrumbs = [
    { name: 'Home', url: `${siteUrl}/` },
    { name: studio.name, url: studioUrl },
    { name: tool.name, url: toolUrl },
  ];

  // Schema.org multi-graph specification
  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${toolUrl}#webapp`,
        name: tool.name,
        url: toolUrl,
        description: tool.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All (Web Browser)',
        browserRequirements: 'Requires a modern web browser.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          '100% Offline & 100% Secure',
          'Zero Cloud Uploads',
          'Offline Capable',
          'Free and Unlimited',
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${toolUrl}#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
      {
        '@type': 'HowTo',
        '@id': `${toolUrl}#howto`,
        name: `How to use ${tool.name}`,
        description: `Step-by-step guide on how to use ${tool.name} online for free and offline.`,
        step: howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${toolUrl}#faq`,
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

  return {
    title,
    description,
    keywords,
    canonicalUrl: toolUrl,
    howToSteps,
    faqs,
    features,
    breadcrumbs,
    schemaGraph,
  };
}

/**
 * Returns studio-level SEO metadata and structured data.
 */
export function getStudioSeoData(
  studio: StudioDefinition,
  toolCount: number,
  siteUrl = SITE_URL
): StudioSeoData {
  const studioUrl = `${siteUrl}/studio/${studio.id}`;
  const title = `${studio.name} — Free Online Utilities (100% Offline & 100% Secure) | Toolstrum`;
  const description = `Explore ${toolCount} free offline ${studio.name} utilities. ${studio.description} 100% offline execution with zero cloud uploads or tracking.`;

  const keywords = [
    `${studio.name.toLowerCase()}`,
    `free online ${studio.name.toLowerCase()}`,
    'offline tools',
    'offline web tools',
    'private utilities',
    'toolstrum',
  ].join(', ');

  const faqs: SeoFaqItem[] = [
    {
      question: `What tools are included in ${studio.name}?`,
      answer: `${studio.name} offers ${toolCount} dedicated utilities for everyday workflows, including ${studio.description}`,
    },
    {
      question: `Are ${studio.name} tools safe for sensitive files and data?`,
      answer: `Yes! Every utility in ${studio.name} runs strictly on your device. No files, text, or data are ever transmitted to remote cloud servers.`,
    },
    {
      question: `Can I use ${studio.name} offline without an internet connection?`,
      answer: `Yes. Once loaded, all operations run 100% offline on your device without needing ongoing network connectivity.`,
    },
  ];

  const breadcrumbs = [
    { name: 'Home', url: `${siteUrl}/` },
    { name: studio.name, url: studioUrl },
  ];

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${studioUrl}#collection`,
        name: `${studio.name} - Toolstrum`,
        description,
        url: studioUrl,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${studioUrl}#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${studioUrl}#faq`,
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

  return {
    title,
    description,
    keywords,
    canonicalUrl: studioUrl,
    faqs,
    breadcrumbs,
    schemaGraph,
  };
}

/**
 * Returns Homepage SEO metadata and schemas.
 */
export function getHomeSeoData(siteUrl = SITE_URL) {
  const title = `Toolstrum — ${OFFLINE_TOOL_COUNT}+ Free Online Tools | 100% Offline & 100% Secure (No Uploads)`;
  const description =
    `${OFFLINE_TOOL_COUNT}+ free offline tools in one unified browser workspace. Convert PDFs, edit images, test regex, calculate finances, and generate QR codes with zero cloud uploads.`;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'Toolstrum',
        url: `${siteUrl}/`,
        description,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Toolstrum',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/favicon.svg`,
      },
    ],
  };

  return {
    title,
    description,
    canonicalUrl: `${siteUrl}/`,
    schemaGraph,
  };
}
