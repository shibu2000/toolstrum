---
name: Modern Electric Utility
colors:
  surface: '#fbf8ff'
  surface-dim: '#d7d8f4'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#edecff'
  surface-container-high: '#e6e6ff'
  surface-container-highest: '#dfe0fc'
  on-surface: '#171a2e'
  on-surface-variant: '#464555'
  inverse-surface: '#2c2f44'
  inverse-on-surface: '#f0efff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4c42e9'
  primary: '#483ee5'
  on-primary: '#ffffff'
  primary-container: '#625bff'
  on-primary-container: '#fefaff'
  inverse-primary: '#c3c0ff'
  secondary: '#8127cf'
  on-secondary: '#ffffff'
  secondary-container: '#9c48ea'
  on-secondary-container: '#fffbff'
  tertiary: '#006476'
  on-tertiary: '#ffffff'
  tertiary-container: '#007f95'
  on-tertiary-container: '#f5fcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0e006a'
  on-primary-fixed-variant: '#311ed2'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#fbf8ff'
  on-background: '#171a2e'
  surface-variant: '#dfe0fc'
  background-cloud: '#F7F8FC'
  surface-white: '#FFFFFF'
  text-muted: '#64748B'
  border-subtle: '#E2E8F0'
  accent-coral: '#FF6B6B'
  accent-emerald: '#10B981'
  accent-amber: '#F59E0B'
  accent-blue: '#3B82F6'
  accent-orange: '#F97316'
  accent-sky: '#0EA5E9'
  accent-teal: '#14B8A6'
  accent-rose: '#EC4899'
  status-success: '#16A34A'
  status-warning: '#F59E0B'
  status-error: '#DC2626'
  surface-pdf: '#FFF0EF'
  surface-image: '#E7F9F1'
  surface-scanner: '#E6FAFD'
  surface-video: '#F5EAFF'
  surface-audio: '#EAF2FF'
  surface-office: '#EEEDFF'
  surface-text: '#FFF1E7'
  surface-developer: '#E8F7FF'
  surface-calculator: '#FFF7E2'
  surface-archive: '#EEF2F6'
  surface-web: '#E5FAF6'
  surface-productivity: '#FDEBF5'
  surface-ai: '#F4EAFE'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# All-in-One Utility App — Stitch Design Specification

**Document purpose:** Source-of-truth design brief for generating the Android app UI in Stitch.
**Platform:** Android first (Portrait)
**Design status:** Initial visual direction
**AI Studio:** Visible in the catalog, display-only, marked Coming Soon

---

## 1. Product Vision & Brand Personality
Modern, energetic, premium, and clean Android utility app housing 500+ everyday tools. Balanced between Google Drive utility, Notion clarity, Adobe Acrobat workflow focus, and Material Design 3 ergonomics.

- **Primary Colors:**
  - Electric Indigo: `#625BFF` (Primary actions, active navigation, key states)
  - Midnight Navy: `#171A2E` (Headings, dark surfaces, high-contrast accents)
  - Vibrant Violet: `#A855F7` (Secondary emphasis, AI studio accents)
  - Electric Cyan: `#06B6D4` (Info accents, scanner accents)
  - Coral: `#FF6B6B` (PDF Studio accent, key alerts)
  - Cloud White: `#F7F8FC` (Main background)
  - Pure White: `#FFFFFF` (Surface, cards, inputs)
  - Muted Slate: `#64748B` (Secondary body, metadata)
  - Border: `#E2E8F0` (Borders, dividers)
  - Success Green: `#16A34A`
  - Warning Amber: `#F59E0B`
  - Error Red: `#DC2626`

- **Hero & Action Gradients:**
  - Primary Hero: `linear-gradient(135deg, #625BFF 0%, #A855F7 100%)`
  - AI Studio Card: `linear-gradient(135deg, #171A2E 0%, #625BFF 50%, #A855F7 100%)`

- **Category Accents & Soft Pale Surfaces:**
  - PDF Studio: Coral `#FF6B6B` / Surface `#FFF0EF`
  - Image Studio: Emerald `#10B981` / Surface `#E7F9F1`
  - Scanner Studio: Cyan `#06B6D4` / Surface `#E6FAFD`
  - Video Studio: Violet `#A855F7` / Surface `#F5EAFF`
  - Audio Studio: Blue `#3B82F6` / Surface `#EAF2FF`
  - Office Studio: Indigo `#625BFF` / Surface `#EEEDFF`
  - Text Tools: Orange `#F97316` / Surface `#FFF1E7`
  - Developer Tools: Sky Blue `#0EA5E9` / Surface `#E8F7FF`
  - Calculators: Amber `#F59E0B` / Surface `#FFF7E2`
  - Archive & Files: Slate `#64748B` / Surface `#EEF2F6`
  - Web Utilities: Teal `#14B8A6` / Surface `#E5FAF6`
  - Productivity: Rose `#EC4899` / Surface `#FDEBF5`
  - AI Studio: Violet Gradient / Pale `#F4EAFE`

- **Typography:** Inter (Android-friendly sans-serif)
  - Screen Headings: 26–30sp, Bold/Semibold
  - Section Titles: 18–20sp, Semibold
  - Card Titles: 14–16sp, Semibold
  - Body: 14–16sp, Regular
  - Secondary/Caption: 12–13sp, Regular
  - Badges/Meta: 11–12sp, Medium

- **Elevation & Layout:**
  - Spacing: 8dp grid (8, 16, 24, 32dp)
  - Screen Padding: 16–20dp
  - Card Radius: 16–20dp (`rounded-2xl` to `rounded-3xl`)
  - Input Radius: 12–16dp (`rounded-xl` to `rounded-2xl`)
  - Button Height: 48–54dp
  - Minimum Touch Target: 48x48dp
  - Soft border (`#E2E8F0`) with subtle elevation/shadows

- **Key Component Tokens:**
  - AppHeader, GlobalSearchBar ("Search 500+ tools"), BottomNavigation (Home, All Tools, Recent, My Files), StudioCard, ToolRow, ToolGridCard, CategoryChip, StatusBadge, FilePickerCard, SelectedFileRow, ProcessingProgress, ResultActionPanel, DownloadProgressCard, ComingSoonCard.
