const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/Users/shibudhara11/Developer/toolstrum/video_output/real_ui';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  console.log('Navigating to Home...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '01_home_dashboard.png') });
  console.log('✓ 01_home_dashboard.png');

  // Hero section capture
  const hero = await page.$('.bg-gradient-to-br');
  if (hero) {
    await hero.screenshot({ path: path.join(OUT_DIR, '01b_hero_banner.png') });
    console.log('✓ 01b_hero_banner.png');
  }

  // PDF Merge Tool
  console.log('Navigating to PDF Merge Tool...');
  await page.goto('http://localhost:5173/tool/4-merge-pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '02a_pdf_empty.png') });
  console.log('✓ 02a_pdf_empty.png');

  // Inject sample file into dropzone to show real active state
  await page.evaluate(() => {
    // Create mock PDF blobs and trigger file input
    const dt = new DataTransfer();
    const file1 = new File(['%PDF-1.4 Mock Contract Q3'], 'Quarterly_Report_2026.pdf', { type: 'application/pdf' });
    const file2 = new File(['%PDF-1.4 Mock Financial Appendix'], 'Audited_Financials.pdf', { type: 'application/pdf' });
    dt.items.add(file1);
    dt.items.add(file2);

    const input = document.querySelector('input[type="file"]');
    if (input) {
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '02b_pdf_files_loaded.png') });
  console.log('✓ 02b_pdf_files_loaded.png');

  // Click merge button if available
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const mergeBtn = btns.find(b => b.textContent && b.textContent.includes('Merge'));
    if (mergeBtn) mergeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '02c_pdf_merged_success.png') });
  console.log('✓ 02c_pdf_merged_success.png');

  // Image Resizer Tool
  console.log('Navigating to Image Resizer Tool...');
  await page.goto('http://localhost:5173/tool/50-image-resizer', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT_DIR, '03a_image_resizer_empty.png') });

  // Developer Studio - JSON Formatter in Dark Mode
  console.log('Navigating to JSON Formatter...');
  await page.goto('http://localhost:5173/tool/244-json-formatter', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(OUT_DIR, '04a_json_formatter_dark_empty.png') });

  // Type raw JSON into textarea
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = '{"product":"Toolstrum","edition":"2026 Enterprise","privacy":"100% Offline","localCompute":true,"encryption":"AES-256","speed":"Instant"}';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '04b_json_formatter_dark_active.png') });
  console.log('✓ 04b_json_formatter_dark_active.png');

  // Dark Mode Home Dashboard
  console.log('Navigating to Dark Mode Home Dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT_DIR, '05_home_dark_full.png') });
  console.log('✓ 05_home_dark_full.png');

  await browser.close();
  console.log('All real UI states successfully captured!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
