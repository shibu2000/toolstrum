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
  console.log('Launching Brave Browser...');
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

  // 1. Capture Splash Screen (held permanently via splash=hold)
  console.log('1. Capturing Splash Screen...');
  await page.goto('http://localhost:5173/?splash=hold', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await saveScreenshot(page, '01_splash_screen.png');

  // 2. Home Dashboard (Light Mode)
  console.log('2. Capturing Home Dashboard (Light)...');
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'light');
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100)); // wait for splash fade
  await saveScreenshot(page, '02_home_dashboard_light.png');
  fs.copyFileSync(path.join(ARTIFACT_DIR, '02_home_dashboard_light.png'), path.join(VIDEO_UI_DIR, '01_home_dashboard.png'));

  // Hero banner close-up
  const heroEl = await page.$('.bg-gradient-to-br');
  if (heroEl) {
    const heroPath = path.join(ARTIFACT_DIR, '02b_hero_banner.png');
    await heroEl.screenshot({ path: heroPath });
    fs.copyFileSync(heroPath, path.join(VIDEO_UI_DIR, '01b_hero_banner.png'));
    console.log('✓ Saved 02b_hero_banner.png');
  }

  // 3. Home Dashboard (Dark Mode)
  console.log('3. Capturing Home Dashboard (Dark)...');
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'dark');
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await saveScreenshot(page, '03_home_dashboard_dark.png');
  fs.copyFileSync(path.join(ARTIFACT_DIR, '03_home_dashboard_dark.png'), path.join(VIDEO_UI_DIR, '05_home_dark_full.png'));

  // Switch back to light mode for standard captures
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'light');
  });

  // 4. Productivity Studio Overview
  console.log('4. Capturing Productivity Studio Overview...');
  await page.goto('http://localhost:5173/studio/productivity', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await saveScreenshot(page, '04_productivity_studio.png');

  // 5. Birthday Reminder Tool (Tool 442)
  console.log('5. Capturing Birthday Reminder Tool (Tool 442)...');
  await page.goto('http://localhost:5173/tool/442-birthday-reminder', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  // Empty state first
  await saveScreenshot(page, '05a_birthday_reminder_empty.png');
  
  // Add sample birthdays to showcase the interactive UI & deletion
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    if (inputs.length >= 2) {
      inputs[0].value = 'Alexander Wright';
      inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      inputs[1].value = '1995-12-04';
      inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    }
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Add Birthday'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, '05b_birthday_reminder_active.png');

  // 6. Habit Tracker Tool (Tool 420)
  console.log('6. Capturing Habit Tracker Tool (Tool 420)...');
  await page.goto('http://localhost:5173/tool/420-habit-tracker', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) {
      input.value = 'Deep Work (2 Hours)';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Add Habit'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, '06_habit_tracker.png');

  // 7. PDF Merge Tool (Tool 4)
  console.log('7. Capturing PDF Merge Tool (Tool 4)...');
  await page.goto('http://localhost:5173/tool/4-merge-pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await saveScreenshot(page, '07_pdf_merge.png');
  fs.copyFileSync(path.join(ARTIFACT_DIR, '07_pdf_merge.png'), path.join(VIDEO_UI_DIR, '02a_pdf_empty.png'));

  // 8. JSON Formatter & Validator (Tool 244) - in Dark Mode
  console.log('8. Capturing JSON Formatter & Validator (Tool 244)...');
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'dark');
  });
  await page.goto('http://localhost:5173/tool/244-json-formatter-validator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  // Type sample JSON into the textarea
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = JSON.stringify({
        app: "Toolstrum",
        version: "2.0",
        privacy: "100% Client-Side",
        tools_count: 490,
        zero_telemetry: true,
        license: "MIT"
      }, null, 2);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await saveScreenshot(page, '08_json_formatter_dark.png');
  fs.copyFileSync(path.join(ARTIFACT_DIR, '08_json_formatter_dark.png'), path.join(VIDEO_UI_DIR, '04b_json_formatter_dark_active.png'));

  // Switch back to light mode
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'light');
  });

  // 9. QR Code Studio (Tool 361)
  console.log('9. Capturing QR Code Generator (Tool 361)...');
  await page.goto('http://localhost:5173/tool/361-qr-code-generator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await saveScreenshot(page, '09_qr_generator.png');

  // 10. CSV & Spreadsheet Studio (Tool 162)
  console.log('10. Capturing CSV & Spreadsheet Studio (Tool 162)...');
  await page.goto('http://localhost:5173/tool/162-csv-viewer-editor', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1100));
  await saveScreenshot(page, '10_spreadsheet_studio.png');

  await browser.close();
  console.log('All screenshots successfully refreshed and saved!');
}

run().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
