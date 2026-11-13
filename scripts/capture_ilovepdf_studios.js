const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/shibudhara11/.gemini/antigravity-cli/brain/53f6d735-0d67-4617-8954-c2e7bcdf2d63/screenshots';
const VIDEO_UI_DIR = '/Users/shibudhara11/Developer/toolstrum/video_output/real_ui';

[ARTIFACT_DIR, VIDEO_UI_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function saveScreenshot(page, filename) {
  const p1 = path.join(ARTIFACT_DIR, filename);
  const p2 = path.join(VIDEO_UI_DIR, filename);
  await page.screenshot({ path: p1 });
  fs.copyFileSync(p1, p2);
  console.log(`✓ Saved ${filename}`);
}

async function run() {
  console.log('Launching Brave Browser to capture iLovePDF-style studio highlights...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--force-device-scale-factor=2'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // 1. PDF Studio Overview (Direct equivalent to iLovePDF home)
  console.log('1. PDF Studio Overview...');
  await page.goto('http://localhost:5173/studio/pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_01_pdf_studio_overview.png');

  // 2. PDF Merge Tool (Tool 4)
  console.log('2. PDF Merge Tool (Tool 4)...');
  await page.goto('http://localhost:5173/tool/4-merge-pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_02_pdf_merge_workspace.png');

  // 3. PDF Compress Tool (Tool 6)
  console.log('3. PDF Compress Tool (Tool 6)...');
  await page.goto('http://localhost:5173/tool/6-compress-pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_03_pdf_compress_workspace.png');

  // 4. Image Studio Overview (Direct equivalent to iLoveIMG home)
  console.log('4. Image Studio Overview...');
  await page.goto('http://localhost:5173/studio/image', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_04_image_studio_overview.png');

  // 5. Image Resizer Tool (Tool 50)
  console.log('5. Image Resizer Tool (Tool 50)...');
  await page.goto('http://localhost:5173/tool/50-image-resizer', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_05_image_resizer_workspace.png');

  // 6. Image Compressor Tool (Tool 49)
  console.log('6. Image Compressor Tool (Tool 49)...');
  await page.goto('http://localhost:5173/tool/49-image-compressor', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_06_image_compressor_workspace.png');

  // 7. Archive Studio Overview (ZIP / 7Z / TAR / RAR)
  console.log('7. Archive & Files Studio Overview...');
  await page.goto('http://localhost:5173/studio/archive', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_07_archive_studio_overview.png');

  // 8. ZIP Archive Creator (Tool 181)
  console.log('8. ZIP Archive Tool (Tool 181)...');
  await page.goto('http://localhost:5173/tool/181-create-zip-archive', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_08_create_zip_workspace.png');

  // 9. Office & Documents Studio Overview
  console.log('9. Office & Documents Studio Overview...');
  await page.goto('http://localhost:5173/studio/office', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_09_office_documents_overview.png');

  // 10. Spreadsheet & CSV Studio (Tool 162)
  console.log('10. CSV & Spreadsheet Studio (Tool 162)...');
  await page.goto('http://localhost:5173/tool/162-csv-viewer-editor', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await saveScreenshot(page, 'spotlight_10_spreadsheet_csv_workspace.png');

  await browser.close();
  console.log('All iLovePDF-style studio spotlight screenshots successfully saved!');
}

run().catch(err => {
  console.error('Spotlight capture failed:', err);
  process.exit(1);
});
