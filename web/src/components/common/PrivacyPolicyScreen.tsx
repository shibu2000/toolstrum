import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  HardDrive,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Terminal,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { OFFLINE_TOOL_COUNT } from '../../data/webRegistry';

export const PrivacyPolicyScreen: React.FC = () => {
  const { setActiveStudio, setActiveTool, setIsPrivacyPage, clearHistory } = useAppStore();
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleBackHome = () => {
    setActiveStudio(null);
    setActiveTool(null);
    setIsPrivacyPage(false);
  };

  const handleClearPreferences = () => {
    clearHistory();
    try {
      localStorage.removeItem('toolstrum_recents_v1');
    } catch {}
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Navigation Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Tools & Dashboard</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
          Last Updated: November 2026
        </span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Client-Side Privacy Guarantee</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Toolstrum Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Privacy in Toolstrum is an architectural mandate, not a checkbox. Every single operation across our {OFFLINE_TOOL_COUNT}+ offline utilities executes locally within your web browser sandbox. Your files, documents, pictures, code, and calculations never leave your device.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
              Zero Server Uploads
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
              Zero Telemetry or Analytics
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
              No Accounts or Passwords
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
              Open Source Transparency
            </span>
          </div>
        </div>
      </div>

      {/* Core Privacy Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Server Uploads</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your PDFs, images, videos, audio, and datasets are parsed in-memory using WebAssembly and Web Workers. Zero bytes are uploaded to remote servers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Telemetry</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            No Google Analytics, no tracking pixels, no event beacons, and no session recorders. We do not track what tools you run or what data you input.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pure Device CPU</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Computations run on your device hardware with sub-millisecond local speed. Even if your internet connection disconnects, all tools work seamlessly.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ephemeral Memory</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All files and processed results live exclusively in volatile browser memory. Closing the browser tab instantly and permanently purges all working buffers.
          </p>
        </div>
      </div>

      {/* Comprehensive Policy Document */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-10 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">1</span>
            <span>Introduction & Core Philosophy</span>
          </h2>
          <p>
            Welcome to <strong>Toolstrum</strong>. We believe you should never have to sacrifice the confidentiality of your documents, photos, audio notes, codebases, or financial figures just to convert a file or calculate a metric.
          </p>
          <p>
            Traditional online utilities often upload your private files to remote cloud servers for server-side processing, exposing sensitive data to server breaches, data retention policies, and unauthorized inspection. <strong>Toolstrum rejects this model entirely</strong>.
          </p>
          <p>
            Our web platform is engineered as a zero-cloud, client-side application. The code downloads to your browser once, and from that point onward, all computations, conversions, encodings, and visual analyses execute purely within your browser sandbox.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">2</span>
            <span>Information We Do Not Collect</span>
          </h2>
          <p>Because Toolstrum operates entirely on the client side, our data collection footprint is zero:</p>
          <ul className="list-disc pl-6 space-y-1.5 marker:text-indigo-500">
            <li><strong>No Personally Identifiable Information (PII):</strong> We do not ask for or collect names, email addresses, phone numbers, physical addresses, or payment credentials.</li>
            <li><strong>No User Accounts:</strong> There are no registration flows, sign-ins, social logins, or profile tracking.</li>
            <li><strong>No Uploaded Files or Documents:</strong> Any file you open (PDFs, images, videos, spreadsheets, CSVs, audio) is read via the HTML5 <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">File</code> and <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">FileReader</code> APIs directly into local JavaScript ArrayBuffers. No byte is ever transmitted over the network.</li>
            <li><strong>No Analytics or Telemetry:</strong> We do not employ Google Analytics, Mixpanel, Segment, Hotjar, or third-party marketing pixels.</li>
            <li><strong>No Keystroke or Input Recording:</strong> Form inputs, text generators, password creators, and code editors run locally without telemetry.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">3</span>
            <span>How Local Processing Works (Client-Side Sandboxing)</span>
          </h2>
          <p>
            To deliver desktop-class speed without server dependencies, Toolstrum leverages modern browser standards:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>WebAssembly (Wasm)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                C/C++ and Rust-compiled binaries (e.g. FFmpeg, PDF manipulation) run directly in isolated browser WebAssembly sandboxes at near-native execution speed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Web Workers</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Heavy jobs like image scaling, batch conversions, and ZIP archivers run on dedicated background threads on your multi-core CPU.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-500" />
                <span>SubtleCrypto (Web Crypto API)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cryptographic hashing (SHA-256, SHA-512), HMAC generation, AES encryption, and TOTP algorithms use your operating system's native hardware cryptographic engines.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-indigo-500" />
                <span>HTML5 Canvas & Web Audio</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pixel-level image manipulation, crop/blur filters, QR generation, and audio waveform slicing occur directly within browser rendering pipelines.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">4</span>
            <span>Local Browser Storage (Preferences & Recents)</span>
          </h2>
          <p>
            Toolstrum uses browser <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">localStorage</code> exclusively to save your UI preferences locally on your machine. This data never leaves your browser:
          </p>
          <ul className="list-disc pl-6 space-y-1 marker:text-indigo-500 text-xs sm:text-sm">
            <li><code className="font-mono text-xs">toolstrum_theme_v1</code>: Stores whether you prefer Dark Mode or Light Mode.</li>
            <li><code className="font-mono text-xs">toolstrum_favorites_v1</code>: Stores the numerical IDs of tools you have pinned to favorites.</li>
            <li><code className="font-mono text-xs">toolstrum_recents_v1</code>: Stores the IDs of your most recently launched tools.</li>
          </ul>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleClearPreferences}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear Local History & Preferences</span>
            </button>
            {clearedNotice && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Local preferences and history cleared!</span>
              </span>
            )}
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">5</span>
            <span>Camera & Microphone Hardware Access</span>
          </h2>
          <p>
            Certain interactive utilities—such as the Document Scanner (webcam capture) or the Decibel Sound Meter—request permission to access your device's camera or microphone through standard browser dialogs.
          </p>
          <p>
            <strong>Important:</strong> Media streams are used solely for real-time preview and client-side processing in HTML5 canvas elements. Toolstrum does not stream, save, or relay your video or audio feeds to any server or external service.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">6</span>
            <span>Static Hosting & Content Delivery Networks (CDNs)</span>
          </h2>
          <p>
            Toolstrum web is deployed as static production assets (HTML, JavaScript bundles, CSS, and SVG icons) distributed via high-speed edge networks (such as Vercel and GitHub Pages).
          </p>
          <p>
            When you visit the site, standard HTTP requests are made to retrieve these static assets. Standard web server access logs (such as IP address and User-Agent headers) are handled at the edge network layer in accordance with standard internet infrastructure protocols for DDoS mitigation and static asset caching, but are never linked to any user identity or file activity.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">7</span>
            <span>Children’s Privacy (COPPA Compliance)</span>
          </h2>
          <p>
            Because Toolstrum does not collect any personal information from any user, our services fully comply with the Children’s Online Privacy Protection Act (COPPA) and international child privacy regulations. Students, educators, and children may safely use our educational calculators, unit converters, and PDF tools without risk of data harvesting.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">8</span>
            <span>How to Verify Our Privacy Claims Yourself</span>
          </h2>
          <p>
            You don't need to take our word for it. You can independently verify our 100% offline claim in under 30 seconds using your web browser's built-in developer tools:
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>Independent Verification Procedure</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600">F12</kbd> (or right click and select <strong>Inspect</strong>) to open Browser Developer Tools.</li>
              <li>Switch to the <strong>Network</strong> tab and click <strong>Clear</strong> (the trash can icon).</li>
              <li>Now, drop a large PDF or image into any Toolstrum tool and click process.</li>
              <li>Observe the Network activity: <strong>Zero network calls</strong> are triggered during processing or file export.</li>
              <li>Optional: Disconnect your computer from Wi-Fi entirely. All tools continue to work with zero disruption.</li>
            </ol>
          </div>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">9</span>
            <span>Open Source Transparency & Auditing</span>
          </h2>
          <p>
            Toolstrum is an open-source project released under the permissive MIT License. We welcome independent security audits, code reviews, and community contributions. You can inspect the entire frontend application source code, WebAssembly bridges, and scripts on GitHub.
          </p>
          <div className="pt-1">
            <a
              href="https://github.com/shibu2000/toolstrum"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <span>Inspect Source Code on GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">10</span>
            <span>Contact & Policy Updates</span>
          </h2>
          <p>
            We may periodically update this Privacy Policy to describe new local features or changes in relevant privacy regulations. When updates are published, the "Last Updated" date at the top of this document will be revised accordingly.
          </p>
          <p>
            If you have questions, feedback, or security suggestions regarding this privacy policy or Toolstrum's offline architecture, please open an issue or discussion on our GitHub repository.
          </p>
        </section>

      </div>

      {/* Back to Tools CTA Footer */}
      <div className="p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Ready to explore private, offline utilities?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Browse our {OFFLINE_TOOL_COUNT}+ instant browser tools with complete peace of mind.
          </p>
        </div>

        <button
          onClick={handleBackHome}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0"
        >
          Explore All Tools Now
        </button>
      </div>
    </div>
  );
};
