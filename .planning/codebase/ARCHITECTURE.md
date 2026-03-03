# Architecture

**Analysis Date:** 2026-03-03

## Pattern Overview

**Overall:** Client-server streaming chat application with frontend SPA and serverless backend.

**Key Characteristics:**
- Single-page React application with stateful chat interface
- Streaming message delivery with optimistic UI updates
- Skill-based system prompts loaded server-side for context consistency
- Vercel serverless function for API layer (decouples API key from frontend)
- Tailwind CSS v4 for styling with no build-time CSS generation needed

## Layers

**Presentation Layer:**
- Purpose: Render chat UI, handle user input, display streaming responses
- Location: `src/components/`, `src/App.jsx`
- Contains: React components for chat window, input field, message bubbles
- Depends on: `useChat` hook for state and message operations
- Used by: `src/App.jsx` orchestrates the full UI

**State Management Layer:**
- Purpose: Centralize chat state, manage message history, control streaming lifecycle
- Location: `src/hooks/useChat.js`
- Contains: Chat message array, streaming flag, error state, message send logic
- Depends on: `streamMessage` service function
- Used by: `src/App.jsx` and `src/components/ChatWindow.jsx`, `src/components/ChatInput.jsx`

**API & Integration Layer:**
- Purpose: Frontend-to-backend communication, message streaming simulation
- Location: `src/services/claudeApi.js`
- Contains: `streamMessage()` function that fetches from `/api/chat`, simulates token-by-token delivery
- Depends on: Vercel serverless API endpoint
- Used by: `useChat` hook calls this on each user message

**Backend API Layer:**
- Purpose: Process messages with Claude, inject skill context, return responses
- Location: `api/chat.js` (Vercel serverless function)
- Contains: Anthropic SDK client, system prompt assembly from skill files, message forwarding
- Depends on: Anthropic API, skill files (`SKILL.md`, `guest-insights.md`), `ANTHROPIC_API_KEY` env var
- Used by: Frontend calls via POST to `/api/chat`

**Skill Content Layer:**
- Purpose: Provide domain knowledge and coaching frameworks injected into system prompt
- Location: `.claude/skills/career-transitions/SKILL.md`, `.claude/skills/career-transitions/references/guest-insights.md`
- Contains: Career advisor persona, transition frameworks, 76 product leader insights
- Depends on: None (static files read at request time)
- Used by: `api/chat.js` concatenates these into the system prompt

## Data Flow

**User Message → Response:**

1. User types in `ChatInput` and presses Enter
2. `ChatInput` calls `sendMessage(text)` from `useChat` hook
3. `useChat` appends user message + empty assistant placeholder to state
4. `useChat` calls `streamMessage(apiMessages, onChunk, onDone, onError)`
5. `streamMessage` POSTs to `/api/chat` with message history (role/content only, strips internal `id`)
6. `/api/chat` handler:
   - Checks for valid `ANTHROPIC_API_KEY` environment variable
   - If missing or `sk-ant-`, returns mock response
   - Otherwise: Loads `SKILL.md` and `guest-insights.md` from disk
   - Assembles system prompt with skill content
   - Calls Anthropic `messages.create()` with system prompt + messages
   - Returns JSON: `{ text: response_text }`
7. `streamMessage` splits response into words, delivers word-by-word with 10ms delays
8. `useChat` accumulates chunks via `onChunk` callback, updating assistant placeholder
9. `ChatWindow` auto-scrolls and renders updated message bubbles in real-time

**State Management:**

- Message object shape: `{ id, role, content }` where `id` is internal tracking only
- `useChat` maintains single source of truth for all messages and streaming state
- `isStreaming` flag prevents concurrent requests
- Error state surfaces API failures to user via banner in `App.jsx`

## Key Abstractions

**Message Object:**
- Purpose: Represent individual chat messages with metadata
- Examples: User messages, assistant responses, placeholders during streaming
- Pattern: Object with `{ id, role, content }` where role is "user" or "assistant"
- Internal `id` field stripped before sending to API to minimize payload

**Streaming Contract:**
- Purpose: Decouple response delivery mechanism from message collection
- Examples: `streamMessage(messages, onChunk, onDone, onError)`
- Pattern: Callback-based; caller provides three handlers for incremental chunks, completion, and errors
- Enables flexible delivery (word-by-word in current impl, but could be token-based with real SDK)

**Skill-Augmented Prompts:**
- Purpose: Inject domain knowledge without changing application flow
- Examples: `SKILL.md` (frameworks), `guest-insights.md` (case studies)
- Pattern: Static files read server-side, concatenated into system prompt at request time
- Hot-reloading in dev via Vite file watching; no app restart needed

## Entry Points

**Browser Entry:**
- Location: `index.html` → `src/main.jsx` → `src/App.jsx`
- Triggers: Page load
- Responsibilities: Mount React root, render App shell with header, chat area, input

**API Entry:**
- Location: `api/chat.js` (Vercel serverless handler)
- Triggers: POST to `/api/chat` from `streamMessage()` in frontend
- Responsibilities: Authenticate API key, load skill files, call Anthropic, return text response

**Chat Interaction:**
- Location: `src/hooks/useChat.js` → `sendMessage()` callback
- Triggers: User presses Enter in `ChatInput` or clicks send button
- Responsibilities: Validate input, update UI, call API, stream response into state

## Error Handling

**Strategy:** Errors caught at service layer, propagated to hook, displayed in UI banner.

**Patterns:**
- API layer: Try-catch in `streamMessage`, passes error message to `onError` callback
- Hook layer: `useChat` catches streaming errors, removes placeholder, sets error state
- UI layer: Error message displayed in red banner below header (`src/App.jsx`)
- Invalid API key: Graceful fallback to mock response instead of error (allows development without key)

## Cross-Cutting Concerns

**Logging:** Console-based only. No structured logging framework implemented.

**Validation:**
- Frontend: `ChatInput` trims whitespace, prevents submission if empty or streaming
- Frontend: `useChat` guards against concurrent messages with `isStreaming` flag
- Backend: Checks `ANTHROPIC_API_KEY` exists and is not placeholder value

**Authentication:**
- API key stored in `ANTHROPIC_API_KEY` environment variable (Vercel secret)
- Frontend never sees the key; all API calls go through `/api/chat` backend
- No user authentication layer; single shared AI advisor for all visitors

---

*Architecture analysis: 2026-03-03*
