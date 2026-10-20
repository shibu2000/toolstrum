# All-in-One Utility App --- Stitch Design Specification

**Document purpose:** Source-of-truth design brief for generating the
Android app UI in Stitch.\
**Platform:** Android first\
**Design status:** Initial visual direction\
**AI Studio:** Visible in the catalog, display-only, marked **Coming
Soon**

------------------------------------------------------------------------

## 1. Product vision

Design a modern, premium, energetic, and easy-to-navigate Android
utility app that brings everyday tools into one place. The app is
planned to contain approximately 500 tools across PDF, image, scanning,
video, audio, office/document, archive/file, text, developer,
calculator, QR/barcode, web, productivity, accessibility, and advanced
utility categories.

The app should feel like a polished product---not a cluttered toolbox or
a generic admin dashboard. Users should be able to discover a tool
quickly, understand what it does, select their files, process them, and
save or share the result.

The initial installation should be lightweight. The UI may show
downloadable studios and indicate their download status. Tools that
require internet must be clearly distinguished from tools that work
offline. AI Studio must be visible but non-functional in the initial
release.

## 2. Visual inspiration

Use these products as broad UX references, not as templates to copy:

-   **Google Drive:** familiar Android navigation, clear file actions,
    searchable content.
-   **Notion:** disciplined hierarchy, calm spacing, organized
    information.
-   **Adobe Acrobat:** task-oriented document workflows and recognizable
    file actions.
-   **Modern Material Design 3 apps:** accessible touch targets,
    responsive layouts, coherent components.

Create an original visual identity. Do not reproduce another product's
logo, exact screen composition, or branding.

## 3. Brand personality

The app should feel:

-   Modern and tech-forward
-   Vibrant, confident, and premium
-   Friendly rather than corporate
-   Efficient and trustworthy
-   Visually rich but never chaotic
-   Accessible on smaller Android phones

Avoid an overly muted pastel aesthetic. Also avoid neon overload,
excessive gradients, glassmorphism, thick shadows, tiny text, and
rainbow-colored interfaces.

## 4. Color system

### Primary palette

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  Electric Indigo         `#625BFF`               Primary actions, active
                                                  navigation, selected
                                                  states

  Midnight Navy           `#171A2E`               Strong headings, dark
                                                  theme surfaces, premium
                                                  contrast

  Vibrant Violet          `#A855F7`               Secondary emphasis,
                                                  selected highlights, AI
                                                  Studio artwork

  Electric Cyan           `#06B6D4`               Information accents,
                                                  selected utility
                                                  highlights

  Coral                   `#FF6B6B`               Important secondary
                                                  accents and selected
                                                  PDF actions

  Cloud White             `#F7F8FC`               Main light-theme
                                                  background

  Pure White              `#FFFFFF`               Cards, sheets, input
                                                  surfaces

  Muted Slate             `#64748B`               Secondary text and
                                                  descriptions

  Border                  `#E2E8F0`               Dividers, card borders,
                                                  input outlines

  Success Green           `#16A34A`               Completed, ready, and
                                                  successful states

  Warning Amber           `#F59E0B`               Warnings and attention
                                                  states

  Error Red               `#DC2626`               Errors and destructive
                                                  actions
  -----------------------------------------------------------------------

### Gradient guidance

Use gradients selectively, not everywhere.

-   **Primary gradient:** `#625BFF` → `#A855F7`
-   **Action gradient (optional):** `#625BFF` → `#258BFF`
-   **AI Studio gradient:** `#171A2E` → `#625BFF` → `#A855F7`

Reserve bold gradients for hero cards, occasional studio banners, and
high-value primary actions. Standard cards should use solid surfaces.

### Studio accent colors

Keep the same accent for a studio everywhere it appears. Use a lightly
tinted icon container plus a clear line icon; do not make the entire
screen brightly colored.

  Studio            Accent               Suggested pale surface
  ----------------- -------------------- ------------------------
  PDF Studio        Coral `#FF6B6B`      `#FFF0EF`
  Image Studio      Emerald `#10B981`    `#E7F9F1`
  Scanner Studio    Cyan `#06B6D4`       `#E6FAFD`
  Video Studio      Violet `#A855F7`     `#F5EAFF`
  Audio Studio      Blue `#3B82F6`       `#EAF2FF`
  Office Studio     Indigo `#625BFF`     `#EEEDFF`
  Text Tools        Orange `#F97316`     `#FFF1E7`
  Developer Tools   Sky Blue `#0EA5E9`   `#E8F7FF`
  Calculators       Amber `#F59E0B`      `#FFF7E2`
  Archive & Files   Slate `#64748B`      `#EEF2F6`
  Web Utilities     Teal `#14B8A6`       `#E5FAF6`
  Productivity      Rose `#EC4899`       `#FDEBF5`
  AI Studio         Violet gradient      `#F4EAFE`

## 5. Typography

Use a modern, highly legible Android-friendly sans-serif. Prefer
**Inter** if available; otherwise use the platform's clean sans-serif.

Suggested hierarchy: - Screen title: 26--30 sp, bold/semibold - Section
title: 18--20 sp, semibold - Card title: 14--16 sp, semibold - Body:
14--16 sp, regular - Helper text: 12--13 sp - Metadata and labels:
11--12 sp, ensuring adequate contrast

Use concise labels and sentence case. Avoid all-caps labels except short
technical abbreviations. Maintain accessible contrast and do not use
color alone to communicate status.

## 6. Layout, shapes, and elevation

-   Design for Android phones first, with responsive behavior for
    different screen sizes.
-   Use an 8-point spacing system.
-   Standard screen horizontal padding: 16--20 dp.
-   Standard card radius: 16--20 dp.
-   Input radius: 12--16 dp.
-   Button height: approximately 48--54 dp.
-   Minimum interactive touch target: 48 × 48 dp where practical.
-   Use thin borders and subtle elevation instead of heavy shadows.
-   Keep grids aligned and spacing consistent.
-   Use bottom sheets for lightweight choices and confirmations.
-   Respect Android system insets, status bar, gesture navigation, and
    keyboard behavior.

## 7. Iconography and illustration

Use one consistent outline icon family, such as Lucide-style icons, with
occasional filled emphasis for active states. Icons should be simple,
recognizable, and consistent in stroke weight.

-   Use studio accent colors only in icon containers or small details.
-   Do not use emoji as the primary icon system.
-   Avoid random 3D illustrations on every card.
-   Use abstract geometric shapes sparingly in hero areas.
-   Ensure icon meaning remains clear at small sizes.

## 8. Navigation and information architecture

Use a bottom navigation bar with four destinations:

1.  **Home** --- overview, quick actions, recommended tools, studio
    cards.
2.  **All Tools** --- searchable catalog and filters.
3.  **Recent** --- history and favorites.
4.  **My Files** --- generated outputs and locally accessible
    app-managed files.

Place Settings behind an icon in the top app bar or within a
profile/settings entry. Do not overcrowd bottom navigation with every
studio.

The global search must be easy to find. Search across tool names,
descriptions, and categories. Include recent searches or suggested tools
where helpful.

## 9. Screen specifications

### Screen 1 --- Home

Purpose: help users start a task immediately and discover the app's
breadth.

Include: - Compact app brand mark and app name. - Notification or update
indicator only if it has a real purpose; otherwise use a
settings/profile action. - Prominent global search: "Search 500+
tools". - Short welcome statement such as "Everything useful, in one
place." - A hero card with a restrained indigo-violet gradient and a
concise value proposition. - Three quick actions: **Create PDF**, **Scan
Document**, **Compress Image**. - "Explore Studios" section with a
two-column grid of studio cards. - A compact "Recently used" row or
list. - A visible but understated AI Studio card with a **Coming Soon**
badge. - Bottom navigation: Home, All Tools, Recent, My Files.

Keep the first screen scannable. Do not attempt to show all 500 tools on
Home. Prioritize PDF and Image Studio while leaving other categories
discoverable.

### Screen 2 --- All Tools

Purpose: help users find any tool in a large catalog.

Include: - Screen title and search input. - Horizontal category chips,
including All, PDF, Image, Scan, Video, Audio, Office, Text, Developer,
Calculators, Files, Web, Productivity, Accessibility, Advanced, and AI
Studio. - Optional sort/filter controls and grid/list toggle. - Tool
rows or cards with icon, tool name, one-line description, and a small
status indicator when needed. - Favorite control on each tool. - Clear
distinction between available, downloadable, online-required, and Coming
Soon tools. - Empty state with suggestions when a search returns no
results.

Avoid presenting the entire catalog as a dense wall of colorful cards.
Use compact rows for long tool lists and grids for studio discovery.

### Screen 3 --- Studio landing page

Create a reusable template for PDF Studio, Image Studio, Scanner Studio,
Media Studio, Office Studio, and other categories.

Include: - Back navigation. - Studio icon and title. - Short description
and tool count. - Download status if the studio is downloadable. -
Search within this studio. - Tool groups such as Create, Convert, Edit,
Organize, and Security where relevant. - Popular tools near the top. -
Clear offline/online labels where applicable.

Studio accent colors should identify the category without overwhelming
the interface.

### Screen 4 --- Tool workflow

Create a reusable screen pattern:

1.  Select or import input.
2.  Configure relevant options.
3.  Start processing.
4.  Show progress and allow cancellation where safe.
5.  Preview or confirm the result.
6.  Save, rename, or share the output.

Include: - Clear tool title and short description. - Supported input
formats and file size where relevant. - Large accessible file selection
area. - Selected file list with filename, size, and remove action. -
Only settings relevant to that specific tool. - Strong primary action. -
Progress, success, empty, error, and unsupported-file states. - Helpful
error messages and retry actions.

Do not show irrelevant settings. Keep the workflow focused on completing
one task.

### Screen 5 --- Downloadable studio

Purpose: communicate that a feature can be downloaded and then used
offline where supported.

Include: - Studio icon, title, and short explanation. - Download size
and estimated installed size if known. - Clear "Download studio"
button. - Download progress, pause/cancel if supported, retry on
failure. - Storage requirements. - Explicit explanation of which tools
work offline and which still need internet. - Post-download "Ready to
use" state. - Manage/remove download action if removal is supported.

Never invent download sizes. Display actual values supplied by the app.
Distinguish native feature modules from resource/model packs.

### Screen 6 --- Recent and Favorites

Include: - Tabs or a segmented control for Recent and Favorites. - Tool
name, studio icon, last-used time, and output reference when
available. - Clear history action with confirmation. - Empty states that
guide the user back to All Tools. - Keep privacy in mind; do not expose
sensitive document contents in previews unnecessarily.

### Screen 7 --- My Files

Include: - Generated outputs and app-managed files. - Search and
sorting. - File type icon, filename, size, and modified date. - Open,
rename, share, and delete actions where supported. - Storage usage
summary if reliable. - A clear distinction between app-managed files and
files merely accessed through Android's document picker. - Empty and
permission states.

Do not imply the app can freely browse every file on the device. Respect
Android scoped storage and user-granted access.

### Screen 8 --- AI Studio (Coming Soon)

AI Studio is display-only in the initial release.

Include: - A distinctive but restrained violet gradient hero. - AI
Studio title and a clear **Coming Soon** badge. - Brief explanation that
AI tools are planned for a future release. - Preview list of planned
tools: AI Utility Assistant, AI PDF Assistant, AI Document Extractor, AI
Writing Assistant, AI Image Assistant, AI Translator, AI Voice
Assistant, AI Image-to-Text, AI Resume Builder, AI Code Assistant, AI
Email Assistant, AI Meeting Summarizer, AI Study Assistant, AI Smart
Tool Router, AI Document Comparison, and AI Data Analyst. - Each tool
may have an icon, name, and short description. - All execution controls
must be disabled or omitted. - Do not show a working chat composer,
upload-to-AI action, API status, or claim AI functionality is
available. - Do not require or request an AI API key.

### Screen 9 --- Settings

Include: - Appearance: Light, Dark, System. - Language. - Downloaded
studios and resource management. - Storage management and clearable
temporary files. - Privacy and on-device processing explanation. -
Network/data preferences. - About, version, feedback, and help.

Do not include account or cloud-sync settings unless those features are
actually implemented.

## 10. Component library to establish

Build and reuse the following components: - AppHeader -
GlobalSearchBar - BottomNavigation - StudioCard - ToolRow -
ToolGridCard - CategoryChip - StatusBadge - FavoriteButton -
PrimaryButton and SecondaryButton - FilePickerCard - SelectedFileRow -
ProcessingProgress - ResultActionPanel - DownloadProgressCard -
EmptyState - ErrorState - ConfirmationSheet - OfflineIndicator -
ComingSoonCard

Keep their spacing, radius, typography, and states consistent.

## 11. Status and state language

Use these labels consistently: - **Available** --- ready to use. -
**Download** --- required feature/resource is not installed. -
**Downloading** --- active download with progress. - **Offline** --- the
tool can currently operate without network. - **Internet required** ---
network connection is needed. - **Coming Soon** --- visible but not
executable. - **Processing** --- a task is running. - **Completed** ---
output is ready. - **Failed** --- show a useful explanation and retry
where possible.

Do not imply a feature is offline-capable until its required engine and
resources are installed.

## 12. Accessibility and usability

-   Maintain readable contrast in both light and future dark themes.
-   Use touch targets of at least 48 dp where practical.
-   Provide labels for icon-only actions.
-   Do not rely on color alone for status.
-   Support dynamic font scaling where possible.
-   Keep long filenames and descriptions gracefully truncated with
    access to full details.
-   Include clear loading, empty, error, offline, and permission-denied
    states.
-   Use simple, plain language.
-   Avoid unnecessary onboarding or login barriers.

## 13. Light and dark themes

Design the light theme first using Cloud White backgrounds and white
surfaces. Establish the color tokens so a dark theme can be added
consistently later.

For dark mode: - Use Midnight Navy or a closely related deep neutral for
backgrounds. - Use slightly lighter dark surfaces for cards. - Keep
Electric Indigo as the primary accent. - Adjust text and accent contrast
for readability. - Do not simply invert the light palette.

## 14. Technical realism

This is a design specification, not a claim that every tool has already
been implemented.

-   The app is planned with React Native, Expo, and TypeScript.
-   Some studios may be downloadable modules or resource packs.
-   Some tools run locally; some require internet or external services.
-   The interface must reflect actual feature availability and download
    state.
-   AI Studio is display-only and Coming Soon.
-   Avoid designs that assume an account, cloud upload, backend, or
    permission that may not exist.
-   Do not invent download progress, file sizes, or successful
    processing states.

## 15. Stitch generation workflow

Generate screens in this order: 1. Home --- establish the core visual
identity. 2. All Tools --- test search and category density. 3. Studio
landing page --- create a reusable category template. 4. Tool workflow
--- use Merge PDF as the first example. 5. Downloadable studio --- show
download and ready states. 6. Recent and Favorites. 7. My Files. 8. AI
Studio Coming Soon. 9. Settings.

Use the Home screen as the visual source of truth for subsequent
screens. Keep the same palette, type scale, icon treatment, spacing,
card radius, and bottom navigation.

For each screen, create a high-fidelity Android portrait design with
realistic labels and content. Favor coherent, implementable UI over
decorative concept art.

## 16. First screen acceptance criteria

The Home screen is successful if: - The app looks modern, vibrant, and
premium at first glance. - Indigo/violet provides a strong identity
without flooding the entire screen. - The hierarchy from search to quick
actions to studios is obvious. - PDF and Image Studio are prominent. -
The interface remains calm enough to scan quickly. - Cards are
consistent and not overloaded with gradients. - AI Studio is clearly
marked Coming Soon. - The layout looks realistic for React Native
implementation.
