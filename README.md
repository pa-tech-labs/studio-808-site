# Studio 808 — Website

Marketing website for Studio 808, Chelmsford's creative music studios.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v3
- React Router v6
- react-helmet-async (SEO meta tags)

## Local Development

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview with `npm run preview`.

## Deploy (Vercel)

1. Push to GitHub
2. Import project in Vercel dashboard
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. No environment variables needed

The `vercel.json` handles SPA routing and the `/production-studio` → `/main-production-studio` 301 redirect.

## Replacing Images

All `<img>` tags have empty `src=""` and descriptive `alt` text. Replace with real photo URLs or local files in `public/images/`.

## Pages

| Route | Component | Notes |
|-------|-----------|-------|
| `/` | Home.tsx | Hero, stats, studio grid, features, reviews CTA, map |
| `/studios` | Studios.tsx | All 4 studios overview |
| `/dj-studio` | DjStudios.tsx | Studios 1, 2, 3 detailed |
| `/main-production-studio` | ProductionStudio.tsx | Studio 4, services & pricing |
| `/production-studio` | — | 301 → /main-production-studio |
| `/podcast-studio` | PodcastStudio.tsx | PA Media cross-sell |
| `/about-us` | About.tsx | Origin story, address |
| `/contact` | Contact.tsx | Form + contact details |
| `/blog` | Blog.tsx | Static post listing |
| `/blog/:slug` | NotFound.tsx | Coming soon placeholder |
