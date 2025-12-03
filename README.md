# Profile Builder (React)

Markdown-driven resume builder with two layouts: a web-friendly view for recruiters and a PDF view for exporting/printing. You edit `public/resume.md`, the app parses it, and you can host it on GitHub Pages or Cloudflare Pages. Built with Vite + React (JavaScript).

## Quick start
- Install deps: `npm install`
- Dev server: `npm run dev` (opens on http://localhost:5173)
- Build for production: `npm run build` (outputs to `dist/`)
- Preview build locally: `npm run preview`

## Editing your resume
1) Open `public/resume.md`
2) Update the YAML frontmatter fields:
   - Basics: `name`, `title`, `location`, `email`, `phone`, `website`, `summary`
   - `links`: list of `{ label, url }`
   - `skills`: list of strings
   - `experience`: list of `{ role, company, start, end, details[] }`
   - `projects`: list of `{ name, link, summary }`
   - `education`: list of `{ school, degree, start, end, details }`
3) Save the file, refresh the app (or click “Reload resume.md”)
4) Switch between Web view and PDF view in the UI. Printing always uses the PDF layout; use browser print → “Save as PDF.”

## Deploy options

### GitHub Pages
1) Commit this repo to GitHub.
2) Set the base path for Pages (replace `REPO_NAME`): update `vite.config.js` to include `base: "/REPO_NAME/",` inside `defineConfig(...)`.
3) Build locally with `npm run build` or let Actions build for you.
4) In GitHub, go to Settings → Pages → Source = `GitHub Actions` → pick `Vite` template (or create a simple workflow that runs `npm ci`, `npm run build`, and uploads `dist`).
5) Push changes; Pages will serve from `https://<username>.github.io/REPO_NAME/`.

### Cloudflare Pages
1) In Cloudflare Pages, create a project and connect the GitHub repo.
2) Build command: `npm run build`
3) Output directory: `dist`
4) Deploy. Cloudflare will handle previews on branches and production on main.
