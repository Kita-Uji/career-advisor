# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Environment

Copy `.env.local` (gitignored) with:
```
VITE_CLAUDE_API_KEY=sk-ant-...
```

If the key is absent or set to `sk-ant-`, the app falls back to a mock streaming response — no API calls are made.

## Architecture

Single-page chat UI. Data flows: `useChat` → `claudeApi` → Anthropic streaming API.

**`src/services/claudeApi.js`** — Anthropic SDK client. Loads `SKILL.md` and `guest-insights.md` as raw strings via Vite's `?raw` import and concatenates them into the system prompt. Exports `streamMessage(messages, onChunk, onDone, onError)` which streams tokens via the SDK's `.messages.stream()` iterator. Model: `claude-sonnet-4-6`, `max_tokens: 1024`.

**`src/hooks/useChat.js`** — All chat state. Pre-populates an initial assistant greeting. On send, appends a user message + empty assistant placeholder, then streams chunks into the placeholder by `id`. Strips the internal `id` field before building the API messages array.

**`src/App.jsx`** — Full-height flex shell: fixed header → optional error banner → `ChatWindow` (scrollable) + `ChatInput` (fixed footer), constrained to `max-w-3xl`.

**`src/components/`**
- `ChatWindow` — Maps messages to `MessageBubble`s; shows `TypingIndicator` when streaming and the last message is still empty; auto-scrolls to bottom.
- `ChatInput` — Auto-resizing textarea (max 120px); Enter submits, Shift+Enter inserts newline.
- `MessageBubble` — Renders user/assistant bubbles with role-based styling.
- `TypingIndicator` — Animated dots shown while waiting for the first token.

## Skill Content

`.claude/skills/career-transitions/SKILL.md` — Career advisor persona, frameworks, and coaching questions injected into every system prompt.

`.claude/skills/career-transitions/references/guest-insights.md` — Full database of insights from 76 product leaders, also injected into the system prompt.

Edits to these files are reflected immediately in dev (Vite HMR re-imports the raw strings).

## Tailwind CSS v4

Uses `@tailwindcss/vite` plugin — no `tailwind.config.js`. The only CSS entry point is `src/index.css` which starts with `@import "tailwindcss"`.
