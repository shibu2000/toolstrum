const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_DIR = '/Users/shibudhara11/Developer/toolstrum/web/public';
const ASSETS_DIR = '/Users/shibudhara11/Developer/toolstrum/web/src/assets';

// 1. Standard XML-compliant SVG vector with exact gradients from ToolstrumLogo.tsx
const cleanSvg = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Premium Squircle Gradient -->
    <linearGradient id="ts-grad-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#090D16" />
    </linearGradient>

    <!-- Edge Highlight Glow -->
    <linearGradient id="ts-grad-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#818CF8" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#A855F7" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.7" />
    </linearGradient>

    <!-- Top Wing Left -->
    <linearGradient id="ts-t-left" x1="12" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Top Wing Right -->
    <linearGradient id="ts-t-right" x1="32" y1="16" x2="52" y2="28" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>

    <!-- Prismatic Vertical Stem -->
    <linearGradient id="ts-t-stem" x1="32" y1="20" x2="32" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#EC4899" />
      <stop offset="40%" stop-color="#8B5CF6" />
      <stop offset="80%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>

    <!-- Core Harmonic Beam -->
    <linearGradient id="ts-beam" x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#A7F3D0" stop-opacity="0.5" />
    </linearGradient>

    <!-- Ambient Glow Filter -->
    <filter id="ts-glow" x="4" y="6" width="56" height="56" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Squircle Container -->
  <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#ts-grad-bg)" stroke="url(#ts-grad-border)" stroke-width="1.8" />
  
  <!-- Subtle Ambient Refraction Spots -->
  <circle cx="32" cy="14" r="14" fill="#6366F1" opacity="0.3" filter="blur(8px)" />
  <circle cx="32" cy="40" r="12" fill="#06B6D4" opacity="0.25" filter="blur(6px)" />

  <!-- The Iconic Toolstrum "T" Symbol -->
  <g filter="url(#ts-glow)">
    <!-- Left Crossbar Wing -->
    <path d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z" fill="url(#ts-t-left)" />

    <!-- Right Crossbar Wing -->
    <path d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z" fill="url(#ts-t-right)" />

    <!-- Center Prismatic Crest -->
    <path d="M26 14H38L35 24H29L26 14Z" fill="#C084FC" opacity="0.9" />

    <!-- Vertical T-Spine Pillar -->
    <path d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z" fill="url(#ts-t-stem)" />

    <!-- Central Resonant Chord / Laser Beam -->
    <line x1="32" y1="16" x2="32" y2="46" stroke="url(#ts-beam)" stroke-width="2.5" stroke-linecap="round" />

    <!-- Precision Resonance Nodes -->
    <circle cx="32" cy="20" r="1.8" fill="#FFFFFF" />
    <circle cx="32" cy="30" r="1.4" fill="#E0E7FF" opacity="0.95" />
    <circle cx="32" cy="40" r="1.2" fill="#CFFAFE" opacity="0.85" />
  </g>
</svg>
`;

async function run() {
  console.log('Writing clean SVG favicon...');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), cleanSvg);
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo.svg'), cleanSvg);
  console.log('✓ Updated favicon.svg and logo.svg');

  // Render 1024x1024 master PNG using Brave
  console.log('Rendering 1024x1024 master PNG from vector SVG...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1024,1024']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0; padding:0; background:transparent; display:flex; align-items:center; justify-content:center; width:1024px; height:1024px;">
        <div style="width:1024px; height:1024px;">
          ${cleanSvg.replace('width="64" height="64"', 'width="1024" height="1024"')}
        </div>
      </body>
    </html>
  `;
  await page.setContent(html, { waitUntil: 'load' });
  const masterPngPath = path.join(PUBLIC_DIR, 'master_1024.png');
  await page.screenshot({ path: masterPngPath, omitBackground: true });
  await browser.close();
  console.log('✓ Rendered master 1024x1024 PNG');

  // Resize using Python Pillow for ultra-crisp Lanczos downsampling and multi-size ICO
  console.log('Generating crisp PNG sizes & multi-resolution favicon.ico...');
  const pythonScript = `
from PIL import Image

master = Image.open("${masterPngPath}").convert("RGBA")

# 512x512
im512 = master.resize((512, 512), Image.Resampling.LANCZOS)
im512.save("${path.join(PUBLIC_DIR, 'icon-512.png')}", "PNG", optimize=True)

# 192x192
im192 = master.resize((192, 192), Image.Resampling.LANCZOS)
im192.save("${path.join(PUBLIC_DIR, 'icon-192.png')}", "PNG", optimize=True)

# 180x180 (Apple Touch Icon)
im180 = master.resize((180, 180), Image.Resampling.LANCZOS)
im180.save("${path.join(PUBLIC_DIR, 'apple-touch-icon.png')}", "PNG", optimize=True)

# 32x32
im32 = master.resize((32, 32), Image.Resampling.LANCZOS)
im32.save("${path.join(PUBLIC_DIR, 'favicon-32x32.png')}", "PNG", optimize=True)

# 16x16
im16 = master.resize((16, 16), Image.Resampling.LANCZOS)
im16.save("${path.join(PUBLIC_DIR, 'favicon-16x16.png')}", "PNG", optimize=True)

# Multi-resolution ICO (16x16, 32x32, 48x48)
im48 = master.resize((48, 48), Image.Resampling.LANCZOS)
im48.save("${path.join(PUBLIC_DIR, 'favicon.ico')}", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

print("All icon sizes and favicon.ico generated!")
`;

  execSync(`python3 -c '${pythonScript}'`, { stdio: 'inherit' });

  // Clean up master temporary PNG
  if (fs.existsSync(masterPngPath)) fs.unlinkSync(masterPngPath);

  console.log('All favicon and app icon assets successfully updated!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
