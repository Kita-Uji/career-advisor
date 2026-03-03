# Codebase Concerns

**Analysis Date:** 2026-03-03

## Tech Debt

**Client-side API Layer:**
- Issue: `src/services/claudeApi.js` implements a fake streaming mechanism instead of true streaming. It fetches the complete response from `/api/chat`, then artificially delays and chunks the response by splitting on spaces with a 10ms interval.
- Files: `src/services/claudeApi.js`, `src/hooks/useChat.js`
- Impact: The app appears to stream, but all latency is server-side. Users experience a unresponsive delay waiting for the full response, then rapid text display. This defeats the purpose of streaming (showing progress/responsiveness).
- Fix approach: Implement true streaming via `fetch().body.getReader()` or EventSource from the backend. Requires backend to support Server-Sent Events or ReadableStream.

**Message ID Generation:**
- Issue: `useChat.js` uses `Math.random().toString(36).slice(2)` to generate message IDs. This is not cryptographically secure and has collision risk.
- Files: `src/hooks/useChat.js` (line 7)
- Impact: While unlikely to collide in typical usage, IDs should use `crypto.randomUUID()` or similar for production. Current approach is non-standard and unpredictable.
- Fix approach: Replace `makeId()` with `crypto.randomUUID()` for deterministic, secure, and standard-compliant IDs.

**Unvalidated Message Content:**
- Issue: `MessageBubble.jsx` renders message content directly without sanitization. Content comes from the Anthropic API, which is trusted, but the pattern is fragile.
- Files: `src/components/MessageBubble.jsx` (lines 8, 20)
- Impact: If message content ever includes user-supplied markdown or HTML-like text, it will render as plain text due to `whitespace-pre-wrap`. However, there's no protection against XSS if the content source changes.
- Fix approach: Consider adding DOMPurify or similar if content sources expand. For now, content is safe because it's API-generated, but add a comment documenting this assumption.

**Hardcoded API Endpoint:**
- Issue: `claudeApi.js` makes requests to `/api/chat` without configuration. The endpoint is hardcoded.
- Files: `src/services/claudeApi.js` (line 3)
- Impact: If the API endpoint changes (e.g., to a different domain or path), the code must be rebuilt. No environment-based configuration exists for the endpoint URL.
- Fix approach: Move endpoint to `import.meta.env.VITE_API_ENDPOINT` with a fallback default.

## Known Bugs

**Empty Message Placeholder Persistence:**
- Issue: In `useChat.js`, when streaming fails, the placeholder message with empty content is removed (line 47), but this leaves a visual gap if multiple messages are sent rapidly.
- Files: `src/hooks/useChat.js` (line 47)
- Impact: If the user sends a message and the stream fails, the placeholder is deleted, but if they send another message immediately, the previous failure state isn't visually clear. No explicit "failed to get response" message is shown.
- Workaround: The error banner at the top shows the error text, but it's temporal and may not be noticed.

**Scroll Jump on Error:**
- Issue: `ChatWindow.jsx` uses `useEffect` to scroll to bottom on every message change (line 10), including when messages are filtered out due to error (line 47 in useChat). This can cause unexpected scroll behavior.
- Files: `src/components/ChatWindow.jsx` (line 10)
- Impact: When a failed message is removed, the scroll jumps, which may confuse users about what just happened.
- Workaround: None. This is low priority for UX but worth noting.

## Security Considerations

**API Key Exposure Risk:**
- Risk: The Anthropic SDK is instantiated in `api/chat.js` using `process.env.ANTHROPIC_API_KEY`. This is a server-side function, so the key is not exposed to the browser. However, if this file were accidentally moved to the client or misdeployed, the key would be compromised.
- Files: `api/chat.js` (line 16, 42)
- Current mitigation: Running as a Vercel serverless function ensures the key stays server-side. ESLint and build tools don't prevent accidental client imports, but deployment topology protects it.
- Recommendations:
  - Add a comment at the top of `api/chat.js` explicitly stating "SERVER-ONLY - DO NOT IMPORT IN CLIENT CODE"
  - Consider using ESLint rule `@typescript-eslint/no-restricted-imports` if migrating to TypeScript
  - Add a pre-commit hook to check that `api/chat.js` is never imported from `src/`

**Fallback Mock Response Leak:**
- Risk: `api/chat.js` returns a mock response when `ANTHROPIC_API_KEY` is missing or set to `sk-ant-`. This is intentional for development, but exposes the mock response in production if the environment variable is misconfigured.
- Files: `api/chat.js` (lines 18-19)
- Current mitigation: Env var checking in CI/CD and deployment configuration
- Recommendations:
  - Add explicit check: if production environment is detected (e.g., `NODE_ENV === 'production'`) and no real API key exists, fail loudly with 500 error instead of returning mock response
  - Log a warning to error tracking (Sentry, etc.) if mock response is returned in production

**Unrestricted Message Forwarding:**
- Risk: `useChat.js` forwards all messages to the API without validation. A malicious actor could craft oversized message arrays or include special characters intended to manipulate the system prompt.
- Files: `src/hooks/useChat.js` (line 31)
- Current mitigation: Chat window has a 120px max height on textarea, limiting message length per submission. API endpoint has rate limiting on Vercel.
- Recommendations:
  - Add client-side validation: max message length (e.g., 2000 chars), max total conversation size (e.g., 10,000 chars)
  - Add server-side validation in `api/chat.js`: reject messages array if total token count exceeds threshold

## Performance Bottlenecks

**Fake Streaming Latency:**
- Problem: The 10ms delay between word chunks (line 17 in `claudeApi.js`) means a 100-word response takes ~1 second to display after already waiting for the full response from the server.
- Files: `src/services/claudeApi.js` (line 17)
- Cause: Artificial chunking of already-fetched text instead of true streaming
- Improvement path: Implement true HTTP streaming using `fetch().body.getReader()` and emit chunks as they arrive from the server, eliminating the artificial delay loop.

**Scroll Performance on Large Conversations:**
- Problem: `ChatWindow.jsx` renders all messages in a single overflow container. With 100+ messages, this could cause layout thrashing during scroll.
- Files: `src/components/ChatWindow.jsx` (line 14)
- Cause: No virtualization or pagination. Every message stays in the DOM.
- Improvement path: Implement a virtualized list (e.g., `react-window`) if conversations grow beyond 50-100 messages. For now, this is acceptable for typical chat sessions.

**System Prompt Reload on Every Request:**
- Problem: `api/chat.js` reads `SKILL.md` and `guest-insights.md` from disk on every API call (lines 24-28). These files don't change during the session.
- Files: `api/chat.js` (lines 24-28)
- Cause: No caching layer. File I/O is synchronous and blocking.
- Improvement path:
  - Cache the system prompt in memory (module-level variable with a reload mechanism for development)
  - Use `fs.promises.readFile` for async I/O (non-blocking)
  - For production, load these files at initialization time in the Vercel deployment.

## Fragile Areas

**Chat State Dependency Chain:**
- Files: `src/hooks/useChat.js` (lines 17-52)
- Why fragile: The hook manages messages, streaming state, and error state in a single synchronous call. The `apiMessages` array is rebuilt from `messages` state on each send (line 31), then the new message is appended. If the order of operations changes slightly, messages could be duplicated or lost.
- Safe modification: Always use the callback form of `setMessages` to avoid stale closures. Add unit tests for edge cases: empty messages, rapid sends, streaming failures.
- Test coverage: No tests exist for this critical hook.

**API Error Handling:**
- Files: `src/services/claudeApi.js` (lines 9-10, 23)
- Why fragile: Error handling distinguishes between network errors (thrown) and API errors (HTTP status). If the API response structure changes, the JSON parsing (line 13) could fail silently or throw an unhandled error.
- Safe modification: Add explicit type checking or a schema validation library (e.g., Zod) before accessing `text` property on line 13.
- Test coverage: No tests for API responses or error cases.

**Skill File Loading Dependency:**
- Files: `api/chat.js` (lines 23-28)
- Why fragile: The handler assumes `.claude/skills/career-transitions/SKILL.md` and `references/guest-insights.md` exist and are readable. If these files are missing or the path structure changes, the server crashes with an unhandled error.
- Safe modification: Wrap file reads in try-catch and log explicitly. Provide sensible fallback content or return a 500 with a clear error message.
- Test coverage: No tests for file loading or missing file scenarios.

## Scaling Limits

**Vercel Function Concurrency:**
- Current capacity: Vercel free tier allows limited concurrent executions. Each Anthropic API call blocks the function until the response completes (up to 1024 tokens + processing time).
- Limit: If multiple users hit the endpoint simultaneously, queueing could become a bottleneck.
- Scaling path: Monitor function execution metrics in Vercel dashboard. If concurrency limits are hit, migrate to a paid plan or implement request queuing with a message queue (e.g., Bull, RabbitMQ).

**Skill Content Size:**
- Current capacity: `SKILL.md` + `guest-insights.md` are concatenated into every system prompt (lines 30-40 in `api/chat.js`). Combined, these are likely 10-50KB.
- Limit: If skill content exceeds ~100KB or system prompts exceed token limits, Anthropic API will reject requests.
- Scaling path: If skills database grows significantly, implement pagination or chunking. Load only relevant skills based on conversation context (not currently done).

**Message History Accumulation:**
- Current capacity: `useChat.js` accumulates all messages in the `messages` array. With no pagination or pruning, a long conversation could hit browser memory limits or exceed API token limits.
- Limit: Anthropic API has a maximum request size. Conversations with 1000+ messages will eventually exceed this.
- Scaling path: Implement message pruning (keep last N messages) or summarization (replace old messages with a summary) before sending to the API.

## Dependencies at Risk

**Anthropic SDK Version Pinning:**
- Risk: `package.json` pins `@anthropic-ai/sdk` to `^0.78.0`. This allows minor updates but not major versions. If a major version is released with breaking changes, the app will continue to work but may lack new features or have security patches locked behind a major version bump.
- Impact: If Anthropic deprecates the `messages.create()` API or changes the streaming interface, the app would need a manual version bump and code changes.
- Migration plan:
  - Monitor Anthropic's changelog and deprecation notices
  - Plan a migration to the new major version when available
  - Consider locking to an exact version (`"0.78.0"`) instead of `^0.78.0` for stability

**React 19 Stability:**
- Risk: React 19 is recent. While it's production-ready, it has fewer field-tested patterns than React 18. The app uses basic hooks (`useState`, `useCallback`, `useEffect`) which are stable, but no advanced features.
- Impact: Low. The patterns used are standard. Future breaking changes are unlikely.
- Migration plan: Monitor React changelog. Current version is safe.

**Tailwind CSS v4 with Vite:**
- Risk: Using the new `@tailwindcss/vite` plugin which is relatively recent. There are no custom configs, which reduces risk, but future Tailwind updates could change plugin behavior.
- Impact: Unlikely. The plugin is well-tested and follows Vite standards.
- Migration plan: Monitor release notes. Consider pinning to an exact version if stability is critical.

## Missing Critical Features

**No Offline Support:**
- Problem: The app requires an API connection to function. If the network is down or the Vercel function is unavailable, the app is completely unusable.
- Blocks: Users cannot access previous conversations or use the app without connectivity.
- Workaround: None. The fallback mock response is only for missing API keys, not network failures.

**No Persistence:**
- Problem: Chat history is stored only in React state. Refreshing the page clears all messages. There's no localStorage or database backup.
- Blocks: Users lose conversations if they accidentally refresh or close the tab.
- Workaround: Users can copy-paste chat content, but this is poor UX.

**No Rate Limiting on Client:**
- Problem: A user or bot could spam requests without client-side throttling. Only server-side Vercel rate limits apply.
- Blocks: Potential for abuse or accidental DoS from a single user clicking send repeatedly.
- Workaround: API calls are relatively slow (1+ second per response), providing natural throttling.

**No Analytics or Monitoring:**
- Problem: No error tracking (Sentry), logging, or usage metrics. If the app fails for users, the team has no visibility.
- Blocks: Cannot diagnose production issues or understand user behavior.
- Workaround: None. Check Vercel logs manually.

## Test Coverage Gaps

**No Unit Tests for useChat Hook:**
- What's not tested: Message creation, streaming state transitions, error handling, ID generation, edge cases (empty messages, rapid sends, concurrent operations)
- Files: `src/hooks/useChat.js`
- Risk: A refactor or bug fix could silently introduce message ordering issues, duplicate messages, or state corruption without detection.
- Priority: High

**No Tests for API Handler:**
- What's not tested: Valid request handling, invalid request formats, missing skill files, API errors from Anthropic, mock response fallback, response structure
- Files: `api/chat.js`
- Risk: The handler is critical and untested. A deployment could break API responses without detection.
- Priority: High

**No Tests for UI Components:**
- What's not tested: Message rendering, textarea resizing, keyboard events (Enter/Shift+Enter), scroll behavior, typing indicator visibility
- Files: `src/components/`
- Risk: UI bugs (broken submit, incorrect scroll) would only be caught by manual testing.
- Priority: Medium

**No Tests for Edge Cases:**
- What's not tested: Very long messages, special characters, network timeouts, rapid message sends, error recovery
- Files: All
- Risk: Edge cases could cause unexpected behavior in production.
- Priority: Medium

---

*Concerns audit: 2026-03-03*
