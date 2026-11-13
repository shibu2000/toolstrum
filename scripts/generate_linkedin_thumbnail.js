const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUTPUT_PNG = '/Users/shibudhara11/Developer/toolstrum/toolstrum_linkedin_thumbnail.png';
const ARTIFACT_PNG = '/Users/shibudhara11/.gemini/antigravity-cli/brain/53f6d735-0d67-4617-8954-c2e7bcdf2d63/toolstrum_linkedin_thumbnail.png';

// Load base64 screenshots
const pdfScreenPath = '/Users/shibudhara11/.gemini/antigravity-cli/brain/53f6d735-0d67-4617-8954-c2e7bcdf2d63/spotlight_01_pdf_studio_overview.png';
const pdfScreenBase64 = fs.readFileSync(pdfScreenPath).toString('base64');

// Exact Toolstrum Harmonic Sonic Prism SVG Vector from web/src/components/common/ToolstrumLogo.tsx
const toolstrumLogoSvg = `
<svg width="68" height="68" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 10px 24px rgba(99, 102, 241, 0.45));">
  <defs>
    <linearGradient id="ts-grad-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#090D16" />
    </linearGradient>

    <linearGradient id="ts-grad-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#818CF8" stop-opacity="0.5" />
      <stop offset="50%" stop-color="#A855F7" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.4" />
    </linearGradient>

    <linearGradient id="ts-t-left" x1="12" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <linearGradient id="ts-t-right" x1="32" y1="16" x2="52" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>

    <linearGradient id="ts-t-stem" x1="32" y1="20" x2="32" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EC4899" />
      <stop offset="40%" stop-color="#8B5CF6" />
      <stop offset="80%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <linearGradient id="ts-beam" x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#A7F3D0" stop-opacity="0.5" />
    </linearGradient>

    <filter id="ts-glow" x="6" y="8" width="52" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Badge Background -->
  <rect
    x="2"
    y="2"
    width="60"
    height="60"
    rx="16"
    fill="url(#ts-grad-bg)"
    stroke="url(#ts-grad-border)"
    stroke-width="1.8"
  />
  <circle cx="32" cy="14" r="14" fill="#6366F1" opacity="0.3" filter="blur(10px)" />
  <circle cx="32" cy="40" r="12" fill="#06B6D4" opacity="0.25" filter="blur(8px)" />

  <!-- Main Symbol: Geometric Prismatic Harmonic 'T' -->
  <g filter="url(#ts-glow)">
    <!-- Left Wing of T Crossbar -->
    <path
      d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z"
      fill="url(#ts-t-left)"
    />

    <!-- Right Wing of T Crossbar -->
    <path
      d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z"
      fill="url(#ts-t-right)"
    />

    <!-- Central Bevel Crest -->
    <path
      d="M26 14H38L35 24H29L26 14Z"
      fill="#C084FC"
      opacity="0.85"
    />

    <!-- Vertical Prismatic Stem (T-Spine) -->
    <path
      d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z"
      fill="url(#ts-t-stem)"
    />

    <!-- Radiant Inner Strum Beam (The Harmonic Chords) -->
    <line
      x1="32"
      y1="16"
      x2="32"
      y2="46"
      stroke="url(#ts-beam)"
      stroke-width="2.5"
      stroke-linecap="round"
    />

    <!-- Precision Strum Nodes -->
    <circle cx="32" cy="20" r="1.8" fill="#FFFFFF" />
    <circle cx="32" cy="30" r="1.4" fill="#E0E7FF" opacity="0.95" />
    <circle cx="32" cy="40" r="1.2" fill="#CFFAFE" opacity="0.85" />
  </g>
</svg>
`;

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1920px;
      height: 1080px;
      background-color: #0b0f19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, sans-serif;
      overflow: hidden;
      display: flex;
      position: relative;
    }

    /* Ambient Glows */
    .glow-indigo {
      position: absolute;
      width: 950px;
      height: 950px;
      top: -250px;
      left: -200px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(99, 102, 241, 0) 65%);
      pointer-events: none;
    }
    .glow-purple {
      position: absolute;
      width: 850px;
      height: 850px;
      bottom: -200px;
      right: -100px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.24) 0%, rgba(168, 85, 247, 0) 65%);
      pointer-events: none;
    }
    .glow-cyan {
      position: absolute;
      width: 750px;
      height: 750px;
      top: 100px;
      right: 250px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, rgba(6, 182, 212, 0) 60%);
      pointer-events: none;
    }

    /* Grid overlay */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(circle at 50% 50%, black 40%, transparent 80%);
      pointer-events: none;
    }

    /* Container */
    .layout {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      display: flex;
      padding: 80px 90px;
      align-items: center;
      justify-content: space-between;
    }

    /* Left Content Column */
    .left-col {
      width: 960px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    /* Top Pill */
    .top-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      width: fit-content;
      margin-bottom: 28px;
    }
    .dot-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }

    /* Logo & Name */
    .brand-row {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 44px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #ffffff;
      display: flex;
      align-items: center;
    }
    .brand-gradient {
      background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tool-count-pill {
      margin-left: 16px;
      padding: 6px 14px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.45);
      color: #a5b4fc;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    /* Giant Title */
    .main-title {
      font-size: 68px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -0.035em;
      margin-bottom: 22px;
      color: #ffffff;
    }
    .text-highlight {
      background: linear-gradient(135deg, #60a5fa, #818cf8, #c084fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Subtitle */
    .sub-title {
      font-size: 23px;
      font-weight: 500;
      line-height: 1.45;
      color: #94a3b8;
      margin-bottom: 36px;
      max-width: 860px;
    }

    /* 4 Studios Grid */
    .studios-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      max-width: 820px;
      margin-bottom: 42px;
    }
    .studio-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: rgba(30, 41, 59, 0.55);
      border: 1px solid rgba(51, 65, 85, 0.65);
      border-radius: 14px;
      backdrop-filter: blur(12px);
    }
    .studio-icon {
      font-size: 22px;
    }
    .studio-info {
      display: flex;
      flex-direction: column;
    }
    .studio-name {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .studio-desc {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
    }

    /* URL Callout Pill */
    .url-bar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 28px;
      background: linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9));
      border: 2px solid rgba(99, 102, 241, 0.7);
      box-shadow: 0 0 35px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      width: fit-content;
    }
    .url-text {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    .url-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      background: #4f46e5;
      color: #ffffff;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Right Column - Visual App Mockup */
    .right-col {
      position: relative;
      width: 760px;
      height: 720px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mockup-window {
      position: relative;
      width: 720px;
      background: #1e293b;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 
        0 30px 80px -15px rgba(0, 0, 0, 0.8),
        0 0 50px rgba(99, 102, 241, 0.25);
      transform: perspective(1400px) rotateY(-10deg) rotateX(4deg);
    }

    .window-header {
      height: 42px;
      background: #0f172a;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .mac-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .window-title {
      margin-left: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
    }

    .window-content {
      width: 100%;
      height: 480px;
      object-fit: cover;
      object-position: top;
      display: block;
    }

    /* Floating Badges on Mockup */
    .float-card-1 {
      position: absolute;
      top: 60px;
      left: -20px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(99, 102, 241, 0.5);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
      padding: 14px 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 20;
    }
    .float-card-2 {
      position: absolute;
      bottom: 40px;
      right: 10px;
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(16, 185, 129, 0.5);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
      padding: 14px 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 20;
    }
  </style>
</head>
<body>
  <div class="glow-indigo"></div>
  <div class="glow-purple"></div>
  <div class="glow-cyan"></div>
  <div class="grid-bg"></div>

  <div class="layout">
    <!-- Left Column -->
    <div class="left-col">
      <div class="top-badge">
        <div class="dot-pulse"></div>
        100% Client-Side • Zero Cloud Uploads
      </div>

      <div class="brand-row">
        ${toolstrumLogoSvg}
        <div class="brand-title">
          <span>Tool</span><span class="brand-gradient">strum</span>
        </div>
        <span class="tool-count-pill">389+ Tools</span>
      </div>

      <h1 class="main-title">
        The Private Alternative to <span class="text-highlight">iLovePDF</span> & Cloud SaaS.
      </h1>

      <p class="sub-title">
        Merge PDFs, resize images, unpack archives, and edit spreadsheets with zero server latency and total data privacy.
      </p>

      <div class="studios-grid">
        <div class="studio-pill">
          <span class="studio-icon">📄</span>
          <div class="studio-info">
            <span class="studio-name">PDF Studio</span>
            <span class="studio-desc">Merge, Split, Compress & Protect</span>
          </div>
        </div>

        <div class="studio-pill">
          <span class="studio-icon">🖼️</span>
          <div class="studio-info">
            <span class="studio-name">Image Studio</span>
            <span class="studio-desc">Resize, Lossless Compress & WebP</span>
          </div>
        </div>

        <div class="studio-pill">
          <span class="studio-icon">📦</span>
          <div class="studio-info">
            <span class="studio-name">Archive Studio</span>
            <span class="studio-desc">In-Memory ZIP, 7Z & TAR Extractor</span>
          </div>
        </div>

        <div class="studio-pill">
          <span class="studio-icon">📊</span>
          <div class="studio-info">
            <span class="studio-name">Office Studio</span>
            <span class="studio-desc">Interactive CSV & Spreadsheet Editor</span>
          </div>
        </div>
      </div>

      <div class="url-bar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        <span class="url-text">https://toolstrum.vercel.app</span>
        <span class="url-badge">Open Free</span>
      </div>
    </div>

    <!-- Right Column Mockup -->
    <div class="right-col">
      <div class="float-card-1">
        <span style="font-size: 24px;">⚡</span>
        <div>
          <div style="font-size: 14px; font-weight: 800; color: #ffffff;">WebAssembly Speed</div>
          <div style="font-size: 11px; color: #94a3b8;">Instant local processing</div>
        </div>
      </div>

      <div class="mockup-window">
        <div class="window-header">
          <div class="mac-dot dot-red"></div>
          <div class="mac-dot dot-yellow"></div>
          <div class="mac-dot dot-green"></div>
          <span class="window-title">toolstrum.vercel.app/studio/pdf</span>
        </div>
        <img class="window-content" src="data:image/png;base64,${pdfScreenBase64}" alt="PDF Studio UI" />
      </div>

      <div class="float-card-2">
        <span style="font-size: 24px;">🔒</span>
        <div>
          <div style="font-size: 14px; font-weight: 800; color: #34d399;">100% Offline Capable</div>
          <div style="font-size: 11px; color: #94a3b8;">Zero network uploads</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

async function generate() {
  console.log('Generating LinkedIn Thumbnail with official Toolstrum vector logo...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080', '--force-device-scale-factor=2']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  await page.setContent(htmlContent, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 400));

  await page.screenshot({ path: OUTPUT_PNG });
  fs.copyFileSync(OUTPUT_PNG, ARTIFACT_PNG);
  console.log(`✓ Thumbnail with official Toolstrum logo successfully generated at: ${OUTPUT_PNG}`);
  await browser.close();
}

generate().catch(err => {
  console.error('Thumbnail generation failed:', err);
  process.exit(1);
});
