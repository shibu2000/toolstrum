const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');

async function testLogoRender() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1200,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #483EE5 0%, #9C48EA 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 60px;
            font-family: sans-serif;
            color: white;
          }
          .box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h3>Option A: Badge (with dark squircle)</h3>
          <svg width="240" height="240" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ts-grad-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#1E1B4B" />
                <stop offset="50%" stop-color="#0F172A" />
                <stop offset="100%" stop-color="#090D16" />
              </linearGradient>
              <linearGradient id="ts-grad-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#818CF8" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#A855F7" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.8" />
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
                <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#A7F3D0" stop-opacity="0.7" />
              </linearGradient>
              <filter id="ts-glow" x="-10" y="-10" width="84" height="84" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#ts-grad-bg)" stroke="url(#ts-grad-border)" stroke-width="1.8" />
            <circle cx="32" cy="14" r="14" fill="#6366F1" opacity="0.35" filter="blur(8px)" />
            <circle cx="32" cy="40" r="12" fill="#06B6D4" opacity="0.3" filter="blur(6px)" />
            <g filter="url(#ts-glow)">
              <path d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z" fill="url(#ts-t-left)" />
              <path d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z" fill="url(#ts-t-right)" />
              <path d="M26 14H38L35 24H29L26 14Z" fill="#C084FC" opacity="0.9" />
              <path d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z" fill="url(#ts-t-stem)" />
              <line x1="32" y1="16" x2="32" y2="46" stroke="url(#ts-beam)" stroke-width="2.5" stroke-linecap="round" />
              <circle cx="32" cy="20" r="1.8" fill="#FFFFFF" />
              <circle cx="32" cy="30" r="1.4" fill="#E0E7FF" opacity="0.9" />
              <circle cx="32" cy="40" r="1.2" fill="#CFFAFE" opacity="0.8" />
            </g>
          </svg>
        </div>

        <div class="box">
          <h3>Option B: Pure Prismatic 'T' Mark (No dark squircle)</h3>
          <svg width="240" height="240" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ts-t-left-b" x1="12" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#818CF8" />
                <stop offset="100%" stop-color="#4F46E5" />
              </linearGradient>
              <linearGradient id="ts-t-right-b" x1="32" y1="16" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#C084FC" />
                <stop offset="100%" stop-color="#9333EA" />
              </linearGradient>
              <linearGradient id="ts-t-stem-b" x1="32" y1="20" x2="32" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#F472B6" />
                <stop offset="35%" stop-color="#A855F7" />
                <stop offset="70%" stop-color="#38BDF8" />
                <stop offset="100%" stop-color="#34D399" />
              </linearGradient>
              <linearGradient id="ts-beam-b" x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="50%" stop-color="#A5F3FC" />
                <stop offset="100%" stop-color="#6EE7B7" />
              </linearGradient>
              <filter id="glow-b" x="-20" y="-20" width="104" height="104" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="32" cy="32" r="28" fill="#FFFFFF" opacity="0.15" filter="blur(14px)" />
            <g filter="url(#glow-b)">
              <path d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z" fill="url(#ts-t-left-b)" />
              <path d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z" fill="url(#ts-t-right-b)" />
              <path d="M26 14H38L35 24H29L26 14Z" fill="#F3E8FF" opacity="0.95" />
              <path d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z" fill="url(#ts-t-stem-b)" />
              <line x1="32" y1="16" x2="32" y2="46" stroke="url(#ts-beam-b)" stroke-width="3" stroke-linecap="round" />
              <circle cx="32" cy="20" r="2.2" fill="#FFFFFF" />
              <circle cx="32" cy="30" r="1.8" fill="#FFFFFF" />
              <circle cx="32" cy="40" r="1.5" fill="#E0F2FE" />
            </g>
          </svg>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/Users/shibudhara11/Developer/toolstrum/video_output/test_logo_comparison.png' });
  await browser.close();
  console.log('✓ Rendered comparison test!');
}

testLogoRender().catch(console.error);
