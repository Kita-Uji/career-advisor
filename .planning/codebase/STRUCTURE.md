# Codebase Structure

**Analysis Date:** 2026-03-03

## Directory Layout

```
career-advisor/
├── .claude/                    # Skill content and configuration
│   ├── settings.local.json     # Local Claude settings (gitignored)
│   └── skills/
│       └── career-transitions/
│           ├── SKILL.md        # Career advisor persona & frameworks
│           └── references/
│               └── guest-insights.md    # 76 product leader insights
├── .planning/                  # GSD planning documents
│   └── codebase/              # Codebase analysis outputs
├── .vercel/                   # Vercel deployment configuration
├── api/                       # Serverless backend functions
│   └── chat.js               # POST /api/chat handler
├── dist/                     # Production build output (generated)
├── node_modules/             # Dependencies (gitignored)
├── public/                   # Static assets
│   └── vite.svg
├── src/                      # Frontend source code
│   ├── assets/              # (empty, available for images/icons)
│   ├── components/          # React UI components
│   │   ├── ChatInput.jsx    # Text input with auto-resize
│   │   ├── ChatWindow.jsx   # Message list container
│   │   ├── MessageBubble.jsx # Individual message rendering
│   │   └── TypingIndicator.jsx # Animated dots while waiting
│   ├── hooks/               # Custom React hooks
│   │   └── useChat.js      # Chat state and message logic
│   ├── services/            # External service integrations
│   │   └── claudeApi.js    # Anthropic API client
│   ├── App.jsx              # Root component (layout + composition)
│   ├── App.css              # (empty, not used)
│   ├── index.css            # Global styles (Tailwind imports)
│   └── main.jsx             # React root entry point
├── .env.local               # Environment variables (gitignored)
├── .gitignore              # Git exclusions
├── eslint.config.js        # ESLint rules
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
├── vite.config.js          # Vite configuration (React + Tailwind)
├── vercel.json             # Vercel deployment config
├── CLAUDE.md               # Project-specific Claude instructions
└── README.md               # Project documentation
```

## Directory Purposes

**`.claude/skills/career-transitions/`:**
- Purpose: Store domain knowledge and coaching frameworks
- Contains: Career advisor persona definition, structured coaching questions, case studies
- Key files: `SKILL.md` (core framework), `references/guest-insights.md` (insights database)
- Loaded by: `api/chat.js` at request time, injected into Anthropic system prompt
- Edits hot-reload in dev (Vite watches files)

**`api/`:**
- Purpose: Serverless backend functions for Vercel deployment
- Contains: Single handler for POST `/api/chat`
- Key files: `api/chat.js`
- Responsibilities: Authenticate API key, load skill files, call Anthropic SDK

**`src/components/`:**
- Purpose: Reusable React UI components for chat interface
- Contains: Message display, input field, typing indicator
- Key files: `ChatWindow.jsx`, `ChatInput.jsx`, `MessageBubble.jsx`, `TypingIndicator.jsx`
- Patterns: Functional components with hooks, Tailwind styling, no CSS files

**`src/hooks/`:**
- Purpose: Encapsulate chat-specific state and logic
- Contains: Message array, streaming state, error handling
- Key files: `useChat.js` (main hook)
- Dependency: Calls `streamMessage()` from `claudeApi.js`

**`src/services/`:**
- Purpose: External service client abstractions
- Contains: API communication layer
- Key files: `claudeApi.js`
- Responsibility: Fetch from `/api/chat`, simulate streaming delivery

**`public/`:**
- Purpose: Static assets served directly by Vite
- Contains: Image files (icons, logos)
- Key files: `vite.svg`
- Generated: No
- Committed: Yes

## Key File Locations

**Entry Points:**
- `index.html`: Browser entry point; loads `/src/main.jsx` script
- `src/main.jsx`: React root initialization; mounts App to `#root`
- `api/chat.js`: Serverless API endpoint for POST /api/chat

**Configuration:**
- `vite.config.js`: Vite build config with React + Tailwind plugins
- `package.json`: Dependencies (React, Anthropic SDK, Tailwind), build scripts
- `index.html`: HTML template with root div and main script reference
- `.env.local`: VITE_CLAUDE_API_KEY and ANTHROPIC_API_KEY (secrets, gitignored)

**Core Logic:**
- `src/App.jsx`: Top-level layout component, integrates hook + components
- `src/hooks/useChat.js`: All chat state, message handling, streaming orchestration
- `src/services/claudeApi.js`: Frontend-to-backend communication
- `api/chat.js`: Backend message processing with Anthropic SDK

**Styling:**
- `src/index.css`: Global styles; imports Tailwind via `@import "tailwindcss"`
- `src/components/*.jsx`: Inline Tailwind classes for component styling
- No CSS files for individual components (Tailwind only)

**Testing:**
- Not applicable; no test files in codebase

**Skill Content:**
- `.claude/skills/career-transitions/SKILL.md`: Career advisor persona and frameworks
- `.claude/skills/career-transitions/references/guest-insights.md`: Case study database

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ChatWindow.jsx`, `MessageBubble.jsx`)
- Hooks: camelCase prefixed with `use` (e.g., `useChat.js`)
- Services: camelCase (e.g., `claudeApi.js`)
- Styles: Match component name (e.g., `App.css` for `App.jsx`; mostly unused in favor of Tailwind)

**Directories:**
- Feature directories: lowercase plural (e.g., `components/`, `hooks/`, `services/`)
- Feature names: kebab-case in paths (e.g., `career-transitions/`)

**Functions:**
- Components: PascalCase export (e.g., `export default function ChatWindow`)
- Hooks: camelCase (e.g., `export function useChat`)
- Service functions: camelCase (e.g., `streamMessage`)
- Internal helpers: camelCase (e.g., `makeId`, `handleKeyDown`, `submit`)

**Variables:**
- State: camelCase (e.g., `messages`, `isStreaming`, `error`)
- Message object keys: camelCase (e.g., `id`, `role`, `content`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `GREETING`, `MOCK_RESPONSE`)

## Where to Add New Code

**New Feature (e.g., chat settings, conversation management):**
- New hook: `src/hooks/useFeatureName.js`
- New component: `src/components/FeatureName.jsx` (or `src/components/FeatureName/` subdir if complex)
- New service: `src/services/featureNameApi.js`
- Add to App.jsx or relevant parent component
- Tests (if implemented): `src/hooks/useFeatureName.test.js` or `src/components/FeatureName.test.jsx`

**New UI Component:**
- Location: `src/components/ComponentName.jsx`
- Pattern: Functional component, use Tailwind classes, no separate CSS file
- Import from parent: Add to composition in `App.jsx` or existing parent component
- Props: Accept as parameters, document in JSDoc if complex

**Backend Endpoint:**
- Location: `api/endpointName.js` (one Vercel function per file)
- Pattern: Export `default async function handler(req, res)`
- Skill content: Load from `.claude/skills/career-transitions/` if needed
- Environment: Access via `process.env.VARIABLE_NAME`

**Utilities/Helpers:**
- Shared hooks: `src/hooks/useHelperName.js`
- Shared functions: `src/services/helperName.js` or create `src/utils/helperName.js` if not API-related
- Location principle: If component-agnostic, place in `utils/` or `services/`; if hook-specific, colocate in hook file

**Skill Content:**
- Location: `.claude/skills/career-transitions/` subdirectories
- Pattern: `.md` files read as raw strings, injected into system prompt
- Subdirectories: `references/` for external case studies, main dir for persona/frameworks
- Edits reflected immediately in dev via Vite HMR

## Special Directories

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Contains: Minified HTML, CSS, JS bundles

**`node_modules/`:**
- Purpose: Installed npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in .gitignore)
- Managed by: `package-lock.json`

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Generated: Yes (by GSD mapper)
- Committed: Yes (for reference across Claude sessions)

**`.vercel/`:**
- Purpose: Vercel build and deployment cache
- Generated: Yes (by Vercel during deployment)
- Committed: No

---

*Structure analysis: 2026-03-03*
