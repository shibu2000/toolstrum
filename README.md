# Toolstrum 🛠️
### The Ultimate All-in-One Offline Utility Suite
**500+ High-Performance Professional Tools • 100% Offline • Zero Server Uploads • Zero Telemetry**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-brightgreen.svg)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-purple.svg)]()
[![Offline](https://img.shields.io/badge/Offline-Zero%20Network%20Required-success.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-WebAssembly%20%2B%20Hermes-orange.svg)]()

---

## ⚡ What is Toolstrum?

**Toolstrum** is an uncompromising, privacy-first offline utility platform designed to replace dozens of cloud-based web converters, subscription utilities, and telemetry-laden apps. Every single operation — from complex PDF vector rasterization, video re-encoding, and audio vocal isolation to cryptographic signatures, document scanning, and image background removal — runs **100% locally on your device hardware** using WebAssembly, Web Workers, HTML5 Canvas, and native C++ Hermes execution.

> **Privacy Guarantee**: Your files, sensitive financial spreadsheets, confidential legal PDFs, private photographs, and audio recordings **never leave your device**. No servers, no tracking, no rate limits, and no internet connection required.

---

## 📲 Downloads & Device Compatibility Matrix

Toolstrum is available across mobile and desktop platforms. Use the matrix below to identify the exact binary package engineered for your hardware.

| Package / Binary | Platform / Architecture | Size | Target Devices & Use Cases ("Which One For Whom") | Direct Download / Sideload Link |
| :--- | :--- | :---: | :--- | :--- |
| **`toolstrum-arm64-v8a-release.apk`** | **Android**<br>`arm64-v8a` (64-bit) | ~23 MB | **⭐ Recommended for 95% of Android users.**<br>All modern smartphones manufactured since 2017: **Samsung Galaxy** (S8–S25, Z Fold/Flip, A-Series), **Google Pixel** (2–9 Pro), **OnePlus**, **Xiaomi / Poco / Redmi**, **Motorola**, **Oppo**, **Vivo**, **Nothing Phone**, etc. Offers the highest CPU efficiency, lowest battery consumption, and native 64-bit ARM execution. | [Download arm64 APK](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-arm64-v8a-release.apk) |
| **`toolstrum-universal-release.apk`** | **Android**<br>Universal (Fat Binary) | ~48 MB | **Universal Fallback.**<br>Contains native binaries for all CPU architectures (`arm64-v8a`, `armeabi-v7a`, `x86_64`). Choose this if you are uncertain of your device processor, or installing on obscure tablets, rugged devices, or custom Android ROMs. Works on **any Android device running Android 8.0 (Oreo) or newer**. | [Download Universal APK](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-universal-release.apk) |
| **`toolstrum-armeabi-v7a-release.apk`** | **Android**<br>`armeabi-v7a` (32-bit) | ~22 MB | **Legacy & Budget Devices.**<br>Older Android phones, budget Android Go devices, older Kindle Fire tablets, and 32-bit ARM processors. | [Download armeabi APK](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-armeabi-v7a-release.apk) |
| **`toolstrum-x86_64-release.apk`** | **Android**<br>`x86_64` (64-bit Intel/AMD) | ~16 MB | **Emulators & Chromebooks.**<br>Designed for ChromeOS devices running Android apps, Windows 11 Windows Subsystem for Android (WSA), and PC Android emulators (**BlueStacks**, **LDPlayer**, **Android Studio Virtual Devices**). | [Download x86_64 APK](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-x86_64-release.apk) |
| **`toolstrum-ios-unsigned.ipa`** | **iOS / iPadOS**<br>`arm64` Native Device | ~40 MB | **Physical iPhone & iPad Sideloading.**<br>Compatible with **iOS 16.4 through iOS 18+** on iPhone 8 through iPhone 16 Pro Max, iPad Air, iPad Pro, and iPad mini. Can be installed directly without jailbreak via **AltStore**, **Sideloadly**, **TrollStore**, **Scarlet**, or personal Apple Developer accounts. | [Download iOS IPA](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-ios-unsigned.ipa) |
| **`toolstrum-ios-simulator.zip`** | **macOS Simulator**<br>`x86_64` / `arm64` | ~32 MB | **iOS Developers & Simulator Testers.**<br>Pre-compiled `.app` bundle for testing inside Apple Xcode Simulator on Apple Silicon (M1/M2/M3/M4) or Intel Mac systems. Drag-and-drop directly into any booted simulator. | [Download Simulator App](https://github.com/shibu2000/toolstrum/releases/latest/download/toolstrum-ios-simulator.zip) |
| **Progressive Web App (PWA)** | **Web / Desktop / Mobile** | Instant | **Zero Install Web Application.**<br>Accessible directly in any browser (Chrome, Safari, Firefox, Edge, Brave, Arc). Can be installed as a standalone desktop app or mobile home-screen app with 1-click. | [Launch Web App](https://toolstrum.com) |

---

## 📥 Installation & Sideloading Guide

### Android Installation (Direct APK)

1. **Download the APK**: Download `toolstrum-arm64-v8a-release.apk` (or `toolstrum-universal-release.apk`) directly to your device via Chrome, Firefox, or file transfer.
2. **Enable Unknown Apps**: When opening the `.apk`, Android may prompt: *"For your security, your phone is not allowed to install unknown apps from this source"*.
   - Tap **Settings** in the dialog.
   - Toggle **Allow from this source** to **On**.
3. **Install**: Return to the installer prompt and tap **Install**.
4. **Offline Confidence**: Turn off Wi-Fi and Cellular data; launch Toolstrum and verify that 100% of the tools operate at full native speed.

---

### iOS Sideloading Guide (Physical iPhone / iPad)

Because Toolstrum is distributed outside the Apple App Store to maintain complete independence and zero telemetry, install the unsigned `.ipa` using one of the proven sideloading methods below:

#### Method A: Sideloadly (Recommended — Windows & Mac)
1. Download and install [Sideloadly](https://sideloadly.io/) (free, supports Windows and macOS).
2. Connect your iPhone or iPad to your computer via USB (tap **Trust This Computer** if prompted).
3. Download `toolstrum-ios-unsigned.ipa` onto your computer.
4. Drag and drop `toolstrum-ios-unsigned.ipa` into Sideloadly.
5. Enter your Apple ID (used strictly by Apple's free developer server to generate a 7-day personal certificate; no paid developer account required).
6. Click **Start**. Sideloadly will sign and install Toolstrum directly to your device.
7. On your iOS device, go to **Settings > General > VPN & Device Management**, tap your Apple ID under *Developer App*, and tap **Trust**.

#### Method B: AltStore (Mac & Windows)
1. Install [AltServer](https://altstore.io/) on your PC or Mac and install the AltStore app onto your iPhone.
2. Download `toolstrum-ios-unsigned.ipa` in Safari on your iPhone.
3. Open AltStore, go to **My Apps**, tap the **+** icon in the top left, and select the downloaded `toolstrum-ios-unsigned.ipa`.
4. AltStore will sign and install the app with automatic background refresh.

#### Method C: TrollStore (iOS 14.0 – 16.6.1 / 17.0)
If your device runs a TrollStore-supported iOS version, open `toolstrum-ios-unsigned.ipa` in TrollStore for permanent, non-expiring installation with no revokes or re-signing needed.

#### Method D: Xcode iOS Simulator (macOS Developers)
1. Download and extract `toolstrum-ios-simulator.zip`.
2. Launch Simulator: `open -a Simulator`.
3. Drag `Toolstrum.app` and drop it onto the Simulator window, or run in terminal:
   ```bash
   xcrun simctl install booted /path/to/Toolstrum.app
   ```

#### Method E: 1-Tap Safari Web App (PWA)
If you prefer not to sideload an IPA, open the web version in iOS Safari:
1. Navigate to the Toolstrum web app URL.
2. Tap the **Share** button (box with an arrow pointing up) at the bottom of Safari.
3. Scroll down and tap **Add to Home Screen**.
4. Toolstrum will launch as a standalone, fullscreen offline app with full offline Service Worker caching.

---

## 🎛️ The 16 Dedicated Offline Studios (500+ Tools)

Toolstrum organizes its comprehensive capabilities into 16 purpose-built studios:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TOOLSTRUM SUITE                                 │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ 📑 PDF Studio     │ 🖼️ Image Studio   │ 🔍 Scanner & OCR  │ 🎬 Video Studio │
│ 48 Offline Tools  │ 37 Offline Tools  │ 18 Offline Tools  │ 25 Offline Tools│
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 🎵 Audio Studio   │ 📄 Office & Docs  │ 📦 Archive & File │ 💻 Dev & Code   │
│ 25 Offline Tools  │ 27 Offline Tools  │ 24 Offline Tools  │ 40 Offline Tools│
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 🛡️ Security Suite │ 📐 Math & Calc    │ 📊 Text & Writing │ 🎨 Color Studio │
│ 26 Offline Tools  │ 48 Offline Tools  │ 36 Offline Tools  │ 22 Offline Tools│
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ 🌐 Web & Network  │ ⚡ Device & System│ ⏱️ Time & Tasks   │ 🧪 Utilities    │
│ 20 Offline Tools  │ 16 Offline Tools  │ 20 Offline Tools  │ 20 Offline Tools│
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

### 1. 📑 PDF Studio (Tools #1 – #48)
- **Document Reordering with GPU FLIP Sliding Animations**: Drag, drop, move up/down with 60 FPS physics animations and live instant page preview.
- **Merge & Split**: Combine hundreds of PDFs or extract specific page ranges in milliseconds.
- **Compression & Optimization**: Client-side stream optimization and image downsampling.
- **Security**: Add/Remove passwords, 256-bit AES encryption, user/owner permission restrictions.
- **Conversion**: PDF to JPG/PNG, Images to PDF, PDF to HTML/Text, PDF to SVG.
- **Editing & Annotation**: Page rotation, watermark insertion, page numbering, crop margins, signature overlay.

### 2. 🖼️ Image Studio (Tools #49 – #85)
- **AI Background Remover**: 100% on-device neural edge detection and background segmentation.
- **Pro Canvas Resizer & Crop**: Multi-aspect ratio presets (Social, Banner, Print, Avatar) with high-DPI scaling.
- **Multi-Format Transcoder**: Instant conversion between WebP, AVIF, PNG, JPEG, SVG, BMP, and TIFF.
- **Bulk Compressor**: Perceptual quality slider with real-time byte savings estimation.
- **Vectorization**: High-fidelity bitmap-to-SVG vector tracing.
- **Metadata Editor**: View, edit, or completely strip sensitive EXIF GPS coordinates and camera fingerprints.

### 3. 🔍 Document Scanner & OCR (Tools #86 – #103)
- **Perspective Quad-Warp Correction**: Automatic document corner detection and trapezoid deskewing.
- **Document Enhancers**: High-contrast black & white text cleanup, shadow removal, color document smoothing.
- **Offline OCR Engine**: Multilingual client-side text extraction powered by Tesseract WebAssembly.
- **Multi-Page Batch Scanner**: Capture or import consecutive pages, auto-crop, reorder, and compile into searchable PDFs.

### 4. 🎬 Video Studio (Tools #104 – #128)
- **FFmpeg Client-Side Processing**: Native C++ FFmpegKit (mobile) and FFmpeg WebAssembly (web).
- **Video Trimmer & Splitter**: Frame-accurate start/end clipping with visual scrubber.
- **Format Transcoder**: MP4, WebM, MKV, AVI, MOV conversion with H.264/H.265/VP9 codecs.
- **Audio Stripper**: Extract MP3, AAC, or WAV audio tracks directly from video streams.
- **GIF Generator**: High-speed animated GIF creation with palette optimization and frame-rate throttling.

### 5. 🎵 Audio Studio (Tools #129 – #153)
- **Waveform Editor**: Interactive visual audio trimmer and region selector.
- **Audio Isolator**: Vocal and accompaniment separation directly on client hardware.
- **Format Converter**: Lossless WAV, FLAC, MP3, AAC, OGG, and M4A bidirectional conversion.
- **Audio Utilities**: BPM detector, silence remover, volume normalizer, reverse audio, and pitch shifter.

### 6. 📄 Office & Documents (Tools #154 – #180)
- **Word & Spreadsheet Viewer**: Zero-cloud preview for `.docx`, `.xlsx`, and `.pptx`.
- **Markdown Studio**: Live side-by-side GitHub Flavored Markdown editor with PDF and HTML export.
- **Spreadsheet Operations**: CSV to JSON, Excel to CSV, table deduplication, and schema validator.

### 7. 📦 Archive & Files (Tools #181 – #204)
- **Zip / Tar / Gzip / 7z Engine**: Fast compression and extraction using raw stream decompression.
- **Batch Archiver**: Package multi-folder structures directly in the browser or mobile sandbox.
- **Integrity Checker**: Verify CRC32, MD5, and SHA-256 checksums without reading into cloud memory.

### 8. 💻 Developer & Code Studio (Tools #205 – #244)
- **JSON Formatter & Validator**: Highlighting, tree view, path querying, and schema validation.
- **Regex Playground**: Real-time regex match highlighting with explanation tree.
- **JWT Inspector**: Cryptographic header and payload decoder with expiry validation.
- **Base64 / URL / HTML Encoders**: Instant bidirectional transformations.

### 9. 🛡️ Security & Privacy Suite (Tools #245 – #270)
- **Cryptographic Hashing**: SHA-1, SHA-256, SHA-512, MD5, RIPEMD, Blake2b.
- **OpenPGP Encryption**: Encrypt and decrypt messages with public/private PGP key pairs.
- **Steganography Studio**: Conceal and extract encrypted secret payloads inside innocent PNG/JPG carrier images.
- **Secure File Eraser**: Multi-pass pseudo-random overwrite simulator for local data hygiene.

### 10. 📐 Math & Calculators (Tools #271 – #318)
- **Financial Suite**: SIP, EMI, Compound Interest, Loan Amortization, Inflation, and Tax calculators.
- **Scientific Calculator**: Advanced trigonometry, logarithmic, statistical, and algebraic functions.
- **Unit & Currency Converters**: 500+ physical units across mass, velocity, energy, temperature, pressure, and offline currency caches.

### 11. 📊 Text & Writing Studio (Tools #319 – #354)
- **Diff Checker**: Side-by-side visual diff highlighting additions, deletions, and inline modifications.
- **Readability & Statistics**: Flesch-Kincaid grade level, word count, character count, reading time.
- **Case Converters**: camelCase, snake_case, kebab-case, PascalCase, UPPERCASE, Title Case.

### 12. 🎨 Color & Design Studio (Tools #355 – #376)
- **WCAG Accessibility Contrast Checker**: Instant AA/AAA pass/fail validation across font sizes.
- **Palette Generator**: Complementary, triadic, monochromatic, and harmonious color schemes.
- **CSS Generator**: Glassmorphism, mesh gradients, box shadows, and border-radius presets.

### 13. 🌐 Web & Network Tools (Tools #377 – #396)
- **Subnet Calculator**: CIDR notation, subnet masks, usable host ranges, and broadcast addresses.
- **User-Agent Inspector**: Client hardware detection and browser feature matrix.
- **Port Reference**: Comprehensive database of standardized TCP/UDP ports.

### 14. ⚡ Device & System Studio (Tools #397 – #412)
- **Battery & Hardware Inspector**: Health metrics, charging state, cycle estimation.
- **Display Screen Tester**: Pixel defect checks, burn-in verification, multi-touch latency tests.
- **Sensor Dashboard**: Accelerometer, gyroscope, orientation, and magnetometer telemetry.

### 15. ⏱️ Time & Productivity (Tools #413 – #432)
- **Pomodoro & Focus Timer**: Customizable work/break cycles with audio alerts.
- **World Clock & Timezone Converter**: Visual daylight overlap planner across world cities.
- **Habit & Streak Tracker**: Offline local-storage powered daily habit tracking.

### 16. 🧪 Utilities & Miscellaneous (Tools #433 – #500+)
- **Barcode & QR Studio**: Generate and scan QR codes, UPC, EAN, Code 128, DataMatrix with logo embedding.
- **Morse Code & Phonetic Alphabet**: Audio playback, translation, and signal training.
- **Random Generators**: Cryptographically secure random pickers, dice rolls, coin flips, and lottery draws.

---

## 🎨 UI/UX & Motion Engineering

- **GPU FLIP Sliding Animation Engine**: Built on the First-Last-Invert-Play (FLIP) animation pattern. Reordering multiple images or PDF pages translates smoothly across physical coordinates on both web and native mobile with hardware acceleration.
- **Adaptive Dark / Light Themes**: Engineered with an OLED True Black (`#0a0d14`) palette, high-contrast typography, and strict WCAG AAA compliance, preventing glare and conserving battery on mobile displays.
- **Zero-Latency Instant Search**: Instant fuzzy-matching across all 500+ tools with keyboard shortcut `⌘K` / `Ctrl+K`.

---

## 🏗️ Technical Architecture & Stack

```
                        ┌──────────────────────────────────────────────┐
                        │             Toolstrum Monorepo               │
                        └──────────────────────┬───────────────────────┘
                                               │
                    ┌──────────────────────────┴──────────────────────────┐
                    ▼                                                     ▼
     ┌──────────────────────────────┐                      ┌──────────────────────────────┐
     │           web/               │                      │           app/               │
     │      (Vite + React)          │                      │    (Expo + React Native)     │
     ├──────────────────────────────┤                      ├──────────────────────────────┤
     │ • React 19 + TypeScript      │                      │ • React Native 0.79 + Hermes │
     │ • Tailwind CSS v4            │                      │ • Expo 53 SDK                │
     │ • WebAssembly (FFmpeg, OCR)  │                      │ • Native LayoutAnimation     │
     │ • Web Workers & Offscreen    │                      │ • Mobile FFmpegKit C++       │
     │ • Service Workers (PWA)      │                      │ • Native FileSystem & Camera │
     └──────────────────────────────┘                      └──────────────────────────────┘
```

- **Shared Paradigms**: Both codebases share identical tool identifiers, algorithms, state management logic, and design token hierarchies.
- **Offline Delivery**: Web assets are packaged into a self-contained single-page application with PWA manifest and offline cache headers.
- **Mobile Native**: React Native leverages the Hermes high-performance JavaScript engine with Bytecode pre-compilation, minimizing memory footprint and eliminating startup latency.

---

## 🛠️ Local Development & Build Commands

### Prerequisites
- **Node.js**: v20.x or newer
- **Bun**: Latest (`curl -fsSL https://bun.sh/install | bash`)
- **Java**: Temurin JDK 21 (for Android builds)
- **Android SDK**: Build-Tools 35.0.0, Platform 35
- **macOS & Xcode**: Xcode 16.x (for iOS builds)

### 1. Web Application
```bash
# Navigate to web workspace
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

### 2. Android Mobile Application
```bash
# Navigate to app workspace
cd app

# Install dependencies
bun install

# Run on connected Android device / emulator
bun run android

# Build release APKs (outputs to app/android/app/build/outputs/apk/release/)
cd android
./gradlew assembleRelease
```

### 3. iOS Mobile Application
```bash
# Install CocoaPods
cd app/ios
pod install

# Run on iOS Simulator
cd ..
bun run ios

# Build Release for iOS Simulator
xcodebuild -workspace app/ios/Toolstrum.xcworkspace \
  -scheme Toolstrum \
  -configuration Release \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath app/ios/build/derivedDataSimulator \
  CODE_SIGNING_ALLOWED=NO build

# Build Release for Physical iOS Device (Unsigned IPA)
xcodebuild -workspace app/ios/Toolstrum.xcworkspace \
  -scheme Toolstrum \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath app/ios/build/derivedDataDevice \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build
```

---

## 🚀 Automated CI/CD (GitHub Actions)

Toolstrum features a continuous delivery pipeline in [`.github/workflows/release.yml`](.github/workflows/release.yml):
- **Web App**: Automatically compiles, minifies, and packages production distribution tarballs.
- **Android**: Assembles optimized architecture APKs (`arm64-v8a`, `armeabi-v7a`, `universal`, `x86_64`) via Gradle.
- **iOS**: Builds the unsigned `.ipa` for physical devices and `.zip` for iOS Simulators via macOS runners.
- **Releases**: Automatically creates a GitHub Release and attaches all binary packages whenever a version tag (`v*.*.*`) is pushed or dispatched.

To trigger a release manually:
1. Navigate to the **Actions** tab on GitHub.
2. Select **Release & Multiplatform Build**.
3. Click **Run workflow**, specify the version tag (e.g., `v1.0.0`), and launch.

---

## 🔒 Privacy & Security Manifesto

1. **No External Network Calls**: Toolstrum does not make background analytics, telemetry, or metric requests.
2. **Local Processing**: Input files are read directly from local memory and processed using WebAssembly or native C++ libraries.
3. **No Account Required**: No logins, no tracking IDs, no cookies, no subscriptions.
4. **Open Source Transparency**: The codebase is open for audit by security researchers and users worldwide.

---

## 📄 License

Toolstrum is released under the [MIT License](LICENSE). You are free to inspect, modify, and distribute this software.
