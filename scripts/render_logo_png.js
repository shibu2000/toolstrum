const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const SVG_PATH = '/Users/shibudhara11/Developer/toolstrum/web/src/assets/logo.svg';
const OUT_PATH = '/Users/shibudhara11/Developer/toolstrum/video_output/real_logo_512.png';

async function renderLogo() {
  const svgContent = fs.readFileSync(SVG_PATH, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=600,600']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });

  // HTML with transparent background containing the SVG scaled to 512x512
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 512px;
            height: 512px;
          }
          svg {
            width: 512px;
            height: 512px;
            filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45));
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({
    path: OUT_PATH,
    omitBackground: true // Ensure PNG has transparent background!
  });

  await browser.close();
  console.log('✓ Successfully rendered real Toolstrum logo PNG with transparent background to:', OUT_PATH);
}

renderLogo().catch(err => {
  console.error(err);
  process.exit(1);
});
