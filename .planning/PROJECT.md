# Career Advisor — UI Polish

## What This Is

An AI career advisor chat app built with Vite + React and the Anthropic SDK. Users chat with an advisor persona backed by 76 product leader insights. The app is feature-complete; this project focuses on visual polish to make the UI feel more modern and professional.

## Core Value

The chat interface should feel calm, focused, and trustworthy — so users stay in conversation rather than getting distracted by the UI.

## Requirements

### Validated

- ✓ Streaming chat with Anthropic SDK — existing
- ✓ Career advisor persona injected via system prompt (SKILL.md + guest-insights.md) — existing
- ✓ Message bubbles with user/assistant role differentiation — existing
- ✓ Auto-resizing textarea, Enter to send — existing
- ✓ Typing indicator during streaming — existing
- ✓ Mock fallback when API key absent — existing

### Active

- [ ] Message bubbles: remove CA avatar, give assistant messages a soft indigo-50 background
- [ ] Input area: floating elevated card (shadow-lg, rounded-2xl) lifted above the bottom bar

### Out of Scope

- New features (new conversation, history, export) — not requested
- Color scheme changes — user happy with indigo palette
- Header / branding changes — not requested
- Layout restructuring — only bubble and input touch points

## Context

- Stack: Vite + React, Tailwind CSS v4 (`@tailwindcss/vite` plugin, no tailwind.config.js)
- `MessageBubble.jsx` — current: user bubble (indigo-600), assistant bubble (white + shadow-sm) with `CA` avatar (indigo-100 circle)
- `ChatInput.jsx` — current: border-t border-gray-200 bg-white strip at bottom; textarea + icon-only send button side by side

## Constraints

- **Tech stack**: Tailwind CSS v4 only — no custom CSS, no config file
- **Scope**: Two component files only — `MessageBubble.jsx` and `ChatInput.jsx`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Remove CA avatar from assistant bubbles | User chose minimal direction; avatar adds noise without adding value | — Pending |
| Elevated card input (shadow-lg, rounded-2xl) | Makes input feel like the focal point; lifts it off the background | — Pending |

---
*Last updated: 2026-03-03 after initialization*
