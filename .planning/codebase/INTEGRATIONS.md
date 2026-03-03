# External Integrations

**Analysis Date:** 2026-03-03

## APIs & External Services

**Anthropic Claude API:**
- Service: Anthropic Claude (Sonnet 4.6 model)
- What it's used for: AI-powered career advisor responses via streaming message completion
  - SDK/Client: `@anthropic-ai/sdk` (v0.78.0)
  - Auth: Environment variable `ANTHROPIC_API_KEY`
  - Model: `claude-sonnet-4-6`
  - Configuration: `max_tokens: 1024`, system prompt includes skill and guest insight data

## Data Storage

**Databases:**
- Not detected - App is stateless; no persistent database

**File Storage:**
- Skill content files (local filesystem during build/deploy):
  - `.claude/skills/career-transitions/SKILL.md` - Career advisor persona and frameworks
  - `.claude/skills/career-transitions/references/guest-insights.md` - Database of 76 product leader insights
  - Loaded at runtime by `api/chat.js` and built into system prompt
  - Vercel includes these via `vercel.json` configuration for serverless function

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Custom API key-based authentication
  - Implementation: Environment variable `ANTHROPIC_API_KEY` checked at runtime
  - Fallback: Mock response when key is missing or set to `sk-ant-`
  - No user authentication; app is public with rate-limiting via API key

## Monitoring & Observability

**Error Tracking:**
- Not detected (could be added via Vercel's built-in error logging)

**Logs:**
- Vercel serverless function logs available via Vercel dashboard
- Browser console errors available via browser dev tools

## CI/CD & Deployment

**Hosting:**
- Vercel platform for production
- Vercel project ID: `prj_z45R6UWdAK4kXtT2Tp1ktdGosZYb`
- Vercel org ID: `team_Bx5XS1EHJ8IjI9dXCAmmuvMt`

**CI Pipeline:**
- Not explicitly configured
- Vercel automatically builds on git push (typical workflow)

## Environment Configuration

**Required env vars (Vercel):**
- `ANTHROPIC_API_KEY` - Anthropic SDK authentication key (must be set in Vercel project settings)

**Optional env vars:**
- `VITE_CLAUDE_API_KEY` - Not used in current architecture (was used in earlier client-side streaming version)

**Secrets location:**
- `.env.local` - Local development (gitignored)
- Vercel project settings - Production secrets

## API Endpoints

**Incoming (Client-facing):**
- `POST /api/chat` - Career advisor chat endpoint
  - Input: JSON body with `messages` array (conversation history)
  - Output: JSON response with `text` field containing assistant response
  - Handled by: `api/chat.js` (Vercel serverless function)

**Outgoing:**
- HTTP POST to Anthropic API (via @anthropic-ai/sdk)
  - Endpoint: Anthropic's messages API (handled by SDK internally)
  - Includes: `model`, `max_tokens`, `system` prompt, and `messages`

## Webhook & Callback Handling

**Incoming:**
- None detected

**Outgoing:**
- Anthropic streaming response via SDK's `.messages.create()` method
  - Response streamed to client from Vercel function
  - Tokens delivered word-by-word with 10ms delay via `claudeApi.js`

## Request/Response Flow

**Chat Request:**
1. User submits message in React frontend (`src/App.jsx` → `src/hooks/useChat.js`)
2. `useChat.sendMessage()` calls `streamMessage()` from `src/services/claudeApi.js`
3. Frontend fetches `POST /api/chat` with conversation history
4. Vercel function (`api/chat.js`) receives request
5. Loads system prompt from skill files (`.claude/skills/`)
6. Calls Anthropic Claude API via SDK with full prompt context
7. Returns response `{ text: "..." }` to frontend
8. Frontend streams response word-by-word with delay for perceived typing effect

## Skill & Context Integration

**System Prompt Construction:**
- `api/chat.js` reads skill files at runtime:
  - `SKILL.md` - Career advisor frameworks and persona
  - `guest-insights.md` - 76 product leader insights database
  - Concatenates into system prompt for every request
- Vercel config (`vercel.json`) ensures skill files are included in deployed function bundle

---

*Integration audit: 2026-03-03*
