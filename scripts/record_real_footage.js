const puppeteer = require('/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = '/Users/shibudhara11/Developer/toolstrum/video_output/real_frames';
const AUDIO_FILE = '/Users/shibudhara11/Developer/toolstrum/video_output/soundtrack.wav';
const FINAL_VIDEO = '/Users/shibudhara11/Developer/toolstrum/toolstrum_product_demo.mp4';
const ARTIFACT_VIDEO = '/Users/shibudhara11/.gemini/antigravity-cli/brain/53f6d735-0d67-4617-8954-c2e7bcdf2d63/toolstrum_product_demo.mp4';
const FFMPEG_BIN = '/Users/shibudhara11/Developer/toolstrum/video_output/node_modules/ffmpeg-static/ffmpeg';

if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

let globalFrameIndex = 0;

async function recordPhase(page, frameCount, onFrame) {
  for (let i = 0; i < frameCount; i++) {
    const progress = frameCount <= 1 ? 0 : i / (frameCount - 1);
    if (onFrame) {
      await onFrame(progress, i);
    }
    const framePath = path.join(FRAMES_DIR, `frame_${String(globalFrameIndex).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: framePath, type: 'jpeg', quality: 92 });
    globalFrameIndex++;
    if (globalFrameIndex % 60 === 0 || globalFrameIndex === 900) {
      console.log(`Captured ${globalFrameIndex}/900 real footage frames (${((globalFrameIndex/900)*100).toFixed(1)}%)...`);
    }
  }
}

async function run() {
  console.log('Launching Brave Browser to record 100% REAL UI screen footage...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  // Reset theme to light mode initially
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'light');
    document.documentElement.classList.remove('dark');
  });

  // ==============================================================
  // 1. REAL SPLASH SCREEN (Frames 0 - 74: 2.5s)
  // Accurate dynamic tool count & shimmering logo
  // ==============================================================
  console.log('Phase 1: Recording real animated splash screen (389+ tools count)...');
  await page.goto('http://localhost:5173/?splash=hold', { waitUntil: 'networkidle0' });
  await recordPhase(page, 75, async () => {
    await new Promise(r => setTimeout(r, 16));
  });

  // ==============================================================
  // 2. REAL HOME DASHBOARD (Frames 75 - 174: 3.3s)
  // Shows 389+ tools catalog & smooth natural scroll
  // ==============================================================
  console.log('Phase 2: Recording real Home Dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 100, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 520);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 3. REAL PDF STUDIO CONTAINING TOOLS SCREEN (Frames 175 - 274: 3.3s)
  // Shows full 48-tools grid: Merge, Split, Compress, Scan to PDF, etc.
  // ==============================================================
  console.log('Phase 3: Recording real PDF Studio containing tools screen (48 tools grid)...');
  await page.goto('http://localhost:5173/studio/pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 100, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 600);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 4. REAL PDF MERGE TOOL WORKSPACE (Frames 275 - 364: 3.0s)
  // ==============================================================
  console.log('Phase 4: Recording real Merge PDF tool workspace...');
  await page.goto('http://localhost:5173/tool/4-merge-pdf', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 90, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 220);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 5. REAL IMAGE STUDIO CONTAINING TOOLS SCREEN (Frames 365 - 464: 3.3s)
  // Full 37-tools grid: Resizer, Compressor, Crop, Convert, etc.
  // ==============================================================
  console.log('Phase 5: Recording real Image Studio containing tools screen...');
  await page.goto('http://localhost:5173/studio/image', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 100, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 550);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 6. REAL IMAGE RESIZER TOOL WORKSPACE (Frames 465 - 554: 3.0s)
  // ==============================================================
  console.log('Phase 6: Recording real Image Resizer tool workspace...');
  await page.goto('http://localhost:5173/tool/50-image-resizer', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 90, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 240);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 7. REAL ARCHIVE STUDIO CONTAINING TOOLS SCREEN (Frames 555 - 644: 3.0s)
  // Full 24-tools grid: Create ZIP, Extract ZIP, 7Z, TAR, etc.
  // ==============================================================
  console.log('Phase 7: Recording real Archive Studio containing tools screen...');
  await page.goto('http://localhost:5173/studio/archive', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 90, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 450);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 8. REAL OFFICE SPREADSHEET STUDIO (Frames 645 - 734: 3.0s)
  // Live CSV / Spreadsheet Editor grid
  // ==============================================================
  console.log('Phase 8: Recording real Office CSV / Spreadsheet Studio...');
  await page.goto('http://localhost:5173/tool/162-csv-viewer-editor', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 90, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 260);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 9. REAL DARK MODE DASHBOARD (Frames 735 - 809: 2.5s)
  // ==============================================================
  console.log('Phase 9: Recording real Dark Mode Dashboard...');
  await page.evaluate(() => {
    localStorage.setItem('toolstrum_theme_v1', 'dark');
  });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  await recordPhase(page, 75, async (progress) => {
    const t = easeInOut(progress);
    const scrollY = Math.round(t * 360);
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  });

  // ==============================================================
  // 10. REAL CALL-TO-ACTION OUTRO: https://toolstrum.vercel.app (Frames 810 - 899: 3.0s)
  // Clear, high-converting outro with the exact URL
  // ==============================================================
  console.log('Phase 10: Recording real Call-to-Action Outro (https://toolstrum.vercel.app)...');
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.id = 'video-outro-card';
    el.innerHTML = `
      <div id="outro-inner" style="
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: radial-gradient(circle at 50% 45%, #0f172a, #020617);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        ">
          <h1 style="font-size: 64px; font-weight: 900; color: #fff; margin: 0; letter-spacing: -0.03em;">
            Tool<span style="background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">strum</span>
          </h1>
        </div>
        
        <p style="font-size: 22px; font-weight: 600; color: #94a3b8; margin: 0 0 36px 0; letter-spacing: 0.02em;">
          389+ Offline Tools • 100% Client-Side • Zero Data Uploads
        </p>

        <div style="
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 44px;
          background: rgba(30, 41, 59, 0.85);
          border: 2px solid rgba(99, 102, 241, 0.7);
          box-shadow: 0 0 50px rgba(99, 102, 241, 0.35);
          border-radius: 9999px;
        ">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em;">
            https://toolstrum.vercel.app
          </span>
        </div>

        <div style="margin-top: 28px; font-size: 15px; font-weight: 600; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">
          Free Forever • Open in Any Modern Browser
        </div>
      </div>
    `;
    document.body.appendChild(el);
  });

  await recordPhase(page, 90, async (progress, frameIdx) => {
    // Fade in over first 15 frames
    if (frameIdx < 15) {
      const alpha = frameIdx / 15;
      await page.evaluate((a) => {
        const el = document.getElementById('outro-inner');
        if (el) el.style.opacity = String(a);
      }, alpha);
    } else {
      await page.evaluate(() => {
        const el = document.getElementById('outro-inner');
        if (el) el.style.opacity = '1';
      });
    }
  });

  await browser.close();
  console.log(`Total real footage frames captured: ${globalFrameIndex}`);

  // ==============================================================
  // 11. ASSEMBLE WITH NATIVE FFMPEG
  // ==============================================================
  console.log('Compiling updated 100% REAL UI video with native FFmpeg...');
  const cmd = [
    FFMPEG_BIN,
    '-y',
    '-r', '30',
    '-i', path.join(FRAMES_DIR, 'frame_%04d.jpg'),
    '-i', AUDIO_FILE,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '17',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    FINAL_VIDEO
  ];

  execSync(cmd.join(' '), { stdio: 'inherit' });

  // Copy to artifacts directory
  fs.copyFileSync(FINAL_VIDEO, ARTIFACT_VIDEO);
  console.log(`SUCCESS! Updated real footage demo video generated at: ${FINAL_VIDEO}`);
}

run().catch(err => {
  console.error('Failed to record real footage:', err);
  process.exit(1);
});
