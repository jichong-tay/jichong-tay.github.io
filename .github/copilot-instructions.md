# Profile Builder - AI Coding Agent Instructions

## Architecture Overview

This is a single-page React app built with Vite that transforms a Markdown file (`public/resume.md`) into an interactive resume with two distinct layouts:

- **Web view**: Modern dark-themed layout with timeline-based experience section, card-based projects, gradient hero section, and interactive hover effects
- **PDF view**: Single-column, print-optimized layout with clean typography and proper page margins (activated on browser print)

The entire resume data lives in `public/resume.md` as YAML frontmatter. The app:

1. Fetches the Markdown file at runtime
2. Parses YAML frontmatter using `gray-matter` library
3. Normalizes the data structure via `normalizeResume()` function (handles various field aliases and formats)
4. Renders two separate component trees: `<WebResume>` and `<PdfResume>`
5. Uses CSS `@media print` queries to hide web view and show PDF layout when printing

## Key Files

- **`src/App.jsx`**: Single-file app containing all logic, data parsing, and both resume layouts
- **`public/resume.md`**: Content source with YAML frontmatter structure (name, title, location, email, phone, linkedin, github, summary, professional experiences, skills and knowledge, online certification, projects, education, languages)
- **`public/profile.png`**: Profile photo displayed in both web and PDF views
- **`src/index.css`**: Complete styling including print media queries that force PDF layout on print
- **`src/main.jsx`**: React entry point
- **`index.html`**: HTML template
- **`vite.config.js`**: Dev server config (port 5173); add `base: "/REPO_NAME/"` for GitHub Pages deployment
- **`.gitignore`**: Standard Vite + React ignore patterns

## Data Flow Pattern

1. **Initialization**: Buffer polyfill loaded for `gray-matter` compatibility
2. **Fetch**: `App` fetches `/resume.md` on mount using `RESUME_PATH` constant (respects `BASE_URL` env var for deployment paths)
3. **Parse**: `gray-matter` library extracts YAML frontmatter from Markdown content
4. **Normalize**: `normalizeResume()` transforms raw data into consistent shape:
   - Generates unique IDs for each item (experience, education, projects)
   - Handles field aliases: `bullets` → `details`, `experience`/`experiences`/`professional experiences` → unified structure
   - Converts arrays/objects to standardized formats
   - Generates link objects from linkedin/github strings
   - Preserves skill category structure
   - Flattens summary arrays to single string
5. **Render**: State updates trigger re-render of both `<WebResume>` and `<PdfResume>` components
6. **Display**: CSS controls visibility - web view shown by default, print view positioned off-screen until printing
7. **Print**: `@media print` CSS hides web view and displays PDF layout with proper page margins

## Resume Schema

The `normalizeResume()` function expects these frontmatter fields in `public/resume.md`:

- **Basics**: `name`, `title`, `location`, `email`, `phone`, `linkedin`, `github`
- **`summary`**: Array of strings (converted to single paragraph) or string
- **`professional experiences`**: Array of `{ role, company, start, end, details[] }` (or `bullets[]`)
- **`skills and knowledge`**: Object with categories as keys, each containing array of skills (flattened to single array)
- **`online cerfification`**: Array of strings (certification names)
- **`projects`**: Array of `{ name, summary, project-name[] }` (project-name merged into summary if present)
- **`education`**: Array of `{ school, name, start, end }` (name maps to degree)
- **`languages`**: String describing language proficiency

All fields are optional; missing data shows placeholder text in the UI. Links are auto-generated from `linkedin` and `github` fields.

## Component Structure

**Main Components:**

- **`App`**: Root component handling data fetching, state management, and rendering both views
- **`WebResume`**: Complete web-optimized resume layout with sections (Hero, Summary, Skills, Experience, Projects, Education, Certifications, Languages)
- **`PdfResume`**: Print-optimized single-column layout for PDF export

**Helper Components:**

- **`ContactLine`**: Renders contact info (location, email, phone) with conditional links for web view
  - Location: plain text with pin emoji (📍)
  - Email: `mailto:` link
  - Phone: WhatsApp link (`https://wa.me/` format)
- **`ContactLinePdf`**: Simplified contact line for PDF (pipe-separated plain text)
- **`LinksLine`**: Renders social/professional links (LinkedIn, GitHub) as styled pills

**Key Helper Functions:**

- **`normalizeList(value)`**: Ensures value is always an array
- **`normalizeResume(data)`**: Main data transformation function - handles all field mapping, ID generation, and structure normalization

## Static Assets

- **`public/resume.md`**: Fetched at runtime via `fetch()` - allows content updates without rebuilding
- **`public/profile.png`**: Referenced as `/profile.png` in both web and PDF views
- Files in `public/` are served at root path and copied as-is to build output (Vite standard practice)

## Styling Patterns

**CSS Architecture:**

- **Design tokens**: CSS custom properties (`:root` variables) for colors, spacing, shadows, and typography
- **Dark theme**: Primary color scheme with cyan accent (`#00d4ff`) and purple secondary (`#7c3aed`)
- **Typography**: Space Grotesk for headings, Inter for body text
- **Responsive**: Mobile-first approach with `@media (max-width: 768px)` breakpoint
- **Print styles**: Dedicated `@media print` rules with `@page` margin control

**Key Styling Classes:**

- `.resume-container`: Main content wrapper (max-width 900px, centered)
- `.hero-section`: Landing section with profile image and name (60vh min-height)
- `.timeline`: Experience section with vertical line and dot markers
- `.project-card`, `.skill-tag`, `.link-pill`: Interactive cards with hover effects
- `.pdf-sheet`: Print layout container with A4 sizing and proper margins

**Contact Styling Patterns:**

- Location (first item): Transparent background, muted color, pin emoji prefix, full-width (own line)
- Email/Phone: Card-style with subtle background, border, hover effects
- Links are wrapped in `<a>` tags with smooth transitions

## Development Workflow

```bash
npm install          # First-time setup
npm run dev          # Dev server at http://localhost:5173
npm run build        # Production build to dist/
npm run preview      # Test production build locally
```

## Dependencies

**Runtime:**

- `react` + `react-dom`: UI framework
- `gray-matter`: YAML frontmatter parser
- `buffer`: Polyfill for gray-matter browser compatibility

**Dev:**

- `vite`: Build tool and dev server
- `@vitejs/plugin-react`: React plugin for Vite

# Design Guidelines for Resume / Portfolio Site

## 🎯 Purpose & Philosophy

- The website should present a **clean, professional, and personal-brand oriented resume/portfolio** — both for **web view** (for human browsing) and **print / PDF view**.
- The design should be **content-first**: the layout, typography and styling should support readability and clarity; content (your data) comes first.
- Maintain a **single source of truth** for data (e.g. in `resume.md`) — design/layout must stay decoupled from data.
- Ensure **responsiveness, accessibility and print-friendliness** — works across devices and when “Save as PDF / Print” is used.

---

## 🧰 Layout & Structure Principles

- Use **semantic HTML** (`<header>`, `<section>`, `<article>`, `<nav>`, `<footer>`, etc.) to mark logical parts of resume/portfolio.
- Define clear **content groups** (e.g. Basics, Summary, Experience, Projects, Education, Skills, Links). Grouping similar information together helps readability. [oai_citation:0‡Hostinger](https://www.hostinger.com/tutorials/web-design-best-practices?utm_source=chatgpt.com)
- Use a **grid or flex layout** for multi-column designs (sidebar + main content) when using two-column style — ensure the layout collapses gracefully on small screens.
- Maintain **visual hierarchy**: meaningful spacing between sections, clear separation between headings, subheadings, body text, and blocks/cards. [oai_citation:1‡Tooltester](https://www.tooltester.com/en/blog/web-typography-best-practices/?utm_source=chatgpt.com)
- Use **card-based containers** for distinct content blocks (e.g. each job, project, education entry) when using “portfolio-style” layout — helps segmentation and readability.

---

## ✍️ Typography & Text Content Guidelines

- Use **readable sans-serif fonts** (or neutral web-safe fonts) for body text. Avoid overly decorative fonts. [oai_citation:2‡Elementor](https://elementor.com/resources/how-to/resume/?utm_source=chatgpt.com)
- Limit number of font families: ideally **1–2 fonts** (one for headings, one for body or both sans-serif). [oai_citation:3‡Avada Website Builder](https://avada.com/blog/a-beginners-guide-to-web-typography/?utm_source=chatgpt.com)
- Establish a clear **typographic hierarchy**: e.g. H1 for main name/title, H2/H3 for section headings, body text for descriptions. Sizes and weights should reflect importance. [oai_citation:4‡Figma](https://www.figma.com/resource-library/typography-in-design/?utm_source=chatgpt.com)
- Set **line height** (leading) for body text such that readability is optimal (e.g. 1.4–1.6 × font-size), especially for longer paragraphs. [oai_citation:5‡Medium](https://medium.com/chetan-bhatia/content-design-for-resumes-portfolios-personal-statements-f7957dc8c1b7?utm_source=chatgpt.com)
- Keep paragraph length moderate (avoid very long blocks): break into smaller paragraphs or bullet lists when possible. This helps skimmability. [oai_citation:6‡Medium](https://medium.com/chetan-bhatia/content-design-for-resumes-portfolios-personal-statements-f7957dc8c1b7?utm_source=chatgpt.com)
- When using lists (skills, bullets, achievements), ensure bullet formatting remains tidy and visually clean; avoid overly long bullet items without breaks. [oai_citation:7‡Medium](https://medium.com/chetan-bhatia/content-design-for-resumes-portfolios-personal-statements-f7957dc8c1b7?utm_source=chatgpt.com)

---

## 🎨 Color, Contrast & Visual Design

- Adopt a **limited, consistent color palette**: base (text), background, accent — avoid using too many colors. This supports brand consistency and avoids visual clutter. [oai_citation:8‡DEV Community](https://dev.to/mohiyaddeen7/the-ultimate-guide-to-web-design-rules-and-best-practices-creating-exceptional-user-experiences-35oe?utm_source=chatgpt.com)
- Maintain **good contrast** between text and background for readability and accessibility. Avoid low-contrast color combinations. [oai_citation:9‡Avada Website Builder](https://avada.com/blog/a-beginners-guide-to-web-typography/?utm_source=chatgpt.com)
- Use **whitespace liberally**. Whitespace around sections, between elements, inside cards improves readability and visual breathing room. [oai_citation:10‡Hostinger](https://www.hostinger.com/tutorials/web-design-best-practices?utm_source=chatgpt.com)
- For “web” view: cards, subtle shadows / rounded corners / soft background shades — but avoid heavy decoration that distracts from content.
- For “print / PDF” view: strip off shadows, background colors (use white backgrounds), simplify styling to plain text + minimal layout. This ensures print output is clean and professional.

---

## 📱 Responsiveness & Layout Adaptability

- Design layouts to **adapt across screen sizes** (desktop → tablet → mobile). E.g., two-column layouts collapse to single column on narrow screens.
- Use relative units (`rem`, `%`, etc.) for spacing and font sizes where possible to improve scalability.
- Ensure that content flows logically even when images/cards shrink or reflow (avoid fixed-width elements that break layout).

---

## 🖨️ Print / PDF View Considerations

- Use a **dedicated print stylesheet** or `@media print` rules to adjust layout: single column, simplified styling, no shadows or background colors.
- Ensure **fonts, line-heights, spacing** remain legible in print.
- Hide any UI chrome (buttons, toggles, interactive UI) in print view — only show resume content.
- Test “Print → Save as PDF” regularly to verify output matches intended layout.

---

## ✅ Content & Presentation Guidelines (for Resume / Portfolio)

- Use **concise but descriptive headings** for each section (e.g. “Experience”, “Projects”, “Education”, “Skills”, “Links”).
- For each experience/project: include **role/title, company/name, duration (start/end), location (if relevant), and bullet-pointed details** (achievements, technologies, impact). This helps highlight accomplishments clearly. [oai_citation:11‡generalassemb.ly](https://generalassemb.ly/blog/ux-resume-portfolio-guide/?utm_source=chatgpt.com)
- Prioritize **relevant skills and projects** — too many unrelated items can clutter and reduce impact. [oai_citation:12‡Learn to Code With Me](https://learntocodewith.me/posts/portfolio-tips/?utm_source=chatgpt.com)
- Provide **contact / link section** (email, LinkedIn/GitHub/website) in hero section below title - location shown first on its own line, followed by actionable contact items (email/phone as clickable cards). Social links displayed as separate styled pills below contact info. [oai_citation:13‡Learn to Code With Me](https://learntocodewith.me/posts/portfolio-tips/?utm_source=chatgpt.com)
- If you choose to include a personal tagline or short summary (“About / Summary”): keep it **short (2–4 lines)** — enough to convey core identity or specialization, without overloading.

---

## 🧩 Template & Theming Guidelines

If you support multiple templates (e.g. Minimal, Two-Column, Timeline), adhere to:

- Shared **design tokens** (CSS variables) for spacing, colors, typography — to ensure consistency across templates.
- Shared **semantic HTML structure** across templates so data model stays consistent.
- Modular template components: each template is a separate component (e.g. `MinimalTemplate.jsx`, `TwoColumnTemplate.jsx`, `TimelineTemplate.jsx`) — they render based on same `resume` data shape.
- Theme support (light / dark) via CSS variables, if desired.

---

## 🔄 Maintenance, Versioning & Content Update Strategy

- Since content is sourced from a Markdown/YAML (`resume.md`), updating your resume is simply a content edit — no layout code changes required.
- Keep styling and design in CSS / template components; avoid mixing content and style.
- When iterating on design (colors, layout tweaks, new templates), test both **web view** and **print view** to ensure consistency.
- Version control (Git) should track both data (`resume.md`) and code/styles separately — so you can track content changes and design changes over time.

---

## 🧑‍💻 Copilot / Developer Guidelines for Working with Design & Layout

When using AI-assisted coding (e.g. GitHub Copilot), the tool should:

- Generate **semantic, accessible HTML markup** (not just `<div>` everywhere)
- Use **CSS variables / design tokens** rather than hard-coded values for colors/spacings/font-sizes
- Respect modular template architecture (each layout variant separate)
- Not embed too many inline styles — prefer class-based styling or CSS modules
- Keep logic and presentation separate (data parsing/normalization vs UI rendering)
- Maintain **responsiveness** by default — mobile-first or fluid layout
- Include print-specific styling when adding new components/layouts that might break print view

---

## 📚 References & Sources for Best Practices

- Use whitespace & grouping to improve readability and visual structure of web content. [oai_citation:14‡Hostinger](https://www.hostinger.com/tutorials/web-design-best-practices?utm_source=chatgpt.com)
- Typography best practices: readable fonts, proper hierarchy, limited number of font families, sufficient line-height, good contrast for accessibility. [oai_citation:15‡Avada Website Builder](https://avada.com/blog/a-beginners-guide-to-web-typography/?utm_source=chatgpt.com)
- Portfolio/resume website design should prioritize clarity, structure, relevance of content, and clean visual presentation. [oai_citation:16‡Creative Lives In Progress](https://creativelivesinprogress.com/articles/a-guide-to-creating-your-portfolio-website?utm_source=chatgpt.com)

---

# End of Design Guidelines
