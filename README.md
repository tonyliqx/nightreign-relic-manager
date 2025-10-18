# Nightreign Relic Manager

A Next.js app inspired by [Relics.pro](https://relics.pro) for creating, optimizing, and sharing Nightreign builds.

## Features

- **Builds**: Create and optimize character builds
- **Compendium**: Browse relics, effects, and bosses database
- **My Relics**: Organize your relic collection

## Development

```bash
cd nightreign-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment to GitHub Pages

This app is configured for GitHub Pages deployment:

1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. The GitHub Action will automatically build and deploy on every push to `main`

The app will be available at: `https://tonyliqx.github.io/nightreign-relic-manager`

## Configuration

The app is configured with:
- TypeScript
- Tailwind CSS
- ESLint
- Next.js App Router
- Static export for GitHub Pages

## Project Structure

```
src/
├── app/
│   ├── builds/page.tsx      # Builds section
│   ├── compendium/page.tsx  # Compendium section
│   ├── my-relics/page.tsx   # My Relics section
│   ├── layout.tsx           # Root layout with navbar
│   └── page.tsx             # Home page
└── types/
    └── relics.ts            # Type definitions
```