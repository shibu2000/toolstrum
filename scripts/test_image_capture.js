const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/Users/shibudhara11/Developer/toolstrum/video_output/real_ui';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  console.log('Testing Image Resizer with file upload...');
  await page.goto('http://localhost:5173/tool/50-image-resizer', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const sampleImagePath = '/Users/shibudhara11/Developer/toolstrum/web/public/icon-512.png';
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.uploadFile(sampleImagePath);
    console.log('Uploaded image to file input');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, '03b_image_resizer_loaded.png') });
    console.log('✓ 03b_image_resizer_loaded.png');

    // Click Resize button if present
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const resizeBtn = btns.find(b => b.textContent && (b.textContent.includes('Resize') || b.textContent.includes('Process')));
      if (resizeBtn) resizeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT_DIR, '03c_image_resizer_processed.png') });
    console.log('✓ 03c_image_resizer_processed.png');
  } else {
    console.log('No file input found');
  }

  await browser.close();
}

run().catch(console.error);
