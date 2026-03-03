# Technology Stack

**Analysis Date:** 2026-03-03

## Languages

**Primary:**
- JavaScript (ES2020+) - React components, hooks, utilities
- JSX - React component syntax in `.jsx` files

**Secondary:**
- Markdown - Skill and insight content files (`.md`)

## Runtime

**Environment:**
- Node.js - Development and Vercel serverless runtime

**Package Manager:**
- npm (v10+)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.0 - UI library and component framework
- Vite 7.3.1 - Build tool and development server with HMR

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite integration for Tailwind

**Testing:**
- Not detected

**Build/Dev:**
- @vitejs/plugin-react 5.1.1 - React fast refresh support
- ESLint 9.39.1 - Code linting
- eslint-plugin-react-hooks 7.0.1 - React hooks linting
- eslint-plugin-react-refresh 0.4.24 - React fast refresh linting
- globals 16.5.0 - Global variable definitions for linting

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.78.0 - Anthropic API client for Claude model integration (server-side in Vercel function)

**Infrastructure:**
- react-dom 19.2.0 - React DOM rendering

## Configuration

**Environment:**
- `.env.local` - Local environment variables (gitignored via `*.local` pattern)
- `VITE_CLAUDE_API_KEY` - Exposed to frontend as Vite env var (client-side streaming in original architecture)
- `ANTHROPIC_API_KEY` - Server-side API key for Vercel function (api/chat.js)

**Build:**
- `vite.config.js` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint configuration (flat config format) with React hooks and refresh rules
- `vercel.json` - Vercel serverless function configuration specifying .claude/skills files inclusion
- `tailwind.config.js` - Not needed; Tailwind v4 uses `@tailwindcss/vite` plugin

**CSS Entry Point:**
- `src/index.css` - Single CSS file with `@import "tailwindcss"` at top

## Platform Requirements

**Development:**
- Node.js (npm included)
- Supports Windows, macOS, Linux
- Vite dev server with HMR for hot module replacement

**Production:**
- Vercel platform for hosting
- Vercel serverless functions (Node.js runtime) for `/api/chat.js` endpoint
- Static frontend build output to `dist/` directory
- `.vercel` directory with project credentials (`project.json`)

## Build & Deploy

**Development:**
```bash
npm run dev       # Start Vite dev server (localhost:5173 typical)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

**Production:**
```bash
npm run build     # Build frontend to dist/
                  # Vercel automatically detects and deploys api/ functions
```

**Deployment:**
- Frontend: Static files in `dist/` served by Vercel edge network
- API: `api/chat.js` deployed as Vercel serverless function
- Environment variable `ANTHROPIC_API_KEY` configured in Vercel project settings

---

*Stack analysis: 2026-03-03*
