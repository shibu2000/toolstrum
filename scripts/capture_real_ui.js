const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/Users/shibudhara11/Developer/toolstrum/video_output/real_ui';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  console.log('Capturing real Toolstrum web UI...');

  // 1. Home Dashboard (Light Mode)
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, '01_home_dashboard.png') });
  console.log('✓ Captured 01_home_dashboard.png');

  // 1b. Hero Banner Close-up
  const heroEl = await page.$('.bg-gradient-to-br');
  if (heroEl) {
    await heroEl.screenshot({ path: path.join(OUT_DIR, '01b_hero_banner.png') });
    console.log('✓ Captured 01b_hero_banner.png');
  }

  // 2. PDF Studio / Merge PDF (Tool 4)
  await page.evaluate(() => {
    // Click on PDF in sidebar or open studio
    const links = Array.from(document.querySelectorAll('a, button'));
    const pdfBtn = links.find(el => el.textContent && el.textContent.includes('PDF Studio'));
    if (pdfBtn) pdfBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Navigate directly to PDF Merge
  await page.goto('http://localhost:5173/pdf/merge-pdf', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, '02_pdf_merge_empty.png') });
  console.log('✓ Captured 02_pdf_merge_empty.png');

  // 3. Image Studio / Image Resizer (Tool 50)
  await page.goto('http://localhost:5173/image/image-resizer', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, '03_image_resizer.png') });
  console.log('✓ Captured 03_image_resizer.png');

  // 4. Developer Studio / JSON Formatter (Tool 244) - Light & Dark
  await page.goto('http://localhost:5173/developer/json-formatter', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, '04_json_formatter_light.png') });
  console.log('✓ Captured 04_json_formatter_light.png');

  // Toggle Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, '04b_json_formatter_dark.png') });
  console.log('✓ Captured 04b_json_formatter_dark.png');

  // 5. Dark Mode Home Dashboard
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, '05_home_dark.png') });
  console.log('✓ Captured 05_home_dark.png');

  await browser.close();
  console.log('All real UI captures complete!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
