# Testing Patterns

**Analysis Date:** 2026-03-03

## Test Framework

**Runner:** Not configured

**Assertion Library:** Not configured

**Run Commands:** No test commands present in `package.json`

**Status:** No testing framework or test suite currently in place. Project contains zero test files in `src/`.

## Test File Organization

**Location:** Not applicable — no tests exist

**Naming:** Not applicable — no tests exist

**Structure:** Not applicable — no tests exist

## Test Framework Recommendations

**Suggested approach for future implementation:**

- **Framework:** Vitest (recommended for Vite projects)
- **Assertion Library:** Vitest built-in assertions or Chai
- **Setup:**
  - Install: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom`
  - Add to `package.json` scripts:
    ```json
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
    ```

## What Should Be Tested

Given current codebase structure, priority test areas:

**1. Hook: `src/hooks/useChat.js`**
- Message state initialization (verify initial greeting present)
- `sendMessage()` callback behavior:
  - Prevents send when streaming or text empty
  - Clears error state on new send
  - Creates user and assistant placeholder messages
  - Appends to existing message history
- Streaming callback integration (onChunk, onDone, onError paths)
- Error recovery (cleans up placeholder on error)

**2. Service: `src/services/claudeApi.js`**
- API call with correct headers and body format
- HTTP error handling (non-ok response code)
- Streaming token chunks via onChunk callback
- onDone called on completion
- onError called on failure
- Currently mocks API response; real SDK integration would need separate tests

**3. Component: `src/components/ChatInput.jsx`**
- Submit on Enter (without Shift)
- Newline on Shift+Enter
- Textarea auto-resize based on content (max 120px)
- Button disabled during streaming
- Button disabled when text empty
- onSend callback triggered with trimmed text
- Text cleared after send

**4. Component: `src/components/ChatWindow.jsx`**
- Auto-scroll to bottom on new messages
- TypingIndicator shown only when streaming and last message empty
- Empty assistant placeholder messages filtered from render
- Messages list renders correctly

**5. Component: `src/components/MessageBubble.jsx`**
- User messages right-aligned with indigo background
- Assistant messages left-aligned with white background
- Content renders whitespace-preserved

**6. Component: `src/components/TypingIndicator.jsx`**
- Renders with correct structure and styling
- Animation delays applied to dots

**7. App-level: `src/App.jsx`**
- Error banner displays when error state present
- Error banner hidden when no error
- Props passed correctly to child components
- Container respects `max-w-3xl` constraint

## Mocking Strategy

**What to Mock:**
- `fetch()` API calls in `src/services/claudeApi.js`
  - Use `vitest.mock()` to replace fetch with spy
  - Return mock response with `{ ok: true, json: () => ({ text: '...' }) }`
- `setTimeout()` in streaming simulation (use `vitest.useFakeTimers()`)
- Anthropic SDK if real implementation uses it (currently uses fetch mock)

**What NOT to Mock:**
- React hooks (`useState`, `useCallback`, `useRef`, `useEffect`)
- Component DOM rendering
- Tailwind CSS classes (verify presence, not rendering)
- Message data structure (test actual shape)

## Testing Library Patterns

**Recommended approach (if implemented):**

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('ChatInput', () => {
  it('submits on Enter key', async () => {
    const mockSend = vi.fn();
    render(<ChatInput onSend={mockSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText(/Ask me anything/);
    await userEvent.type(textarea, 'Hello{Enter}');

    expect(mockSend).toHaveBeenCalledWith('Hello');
  });

  it('does not submit on Shift+Enter', async () => {
    const mockSend = vi.fn();
    render(<ChatInput onSend={mockSend} isStreaming={false} />);

    const textarea = screen.getByPlaceholderText(/Ask me anything/);
    await userEvent.type(textarea, 'Hello{Shift>}{Enter}{/Shift}');

    expect(mockSend).not.toHaveBeenCalled();
  });
});
```

## Async Testing

**Pattern for streaming:**

```javascript
describe('streamMessage', () => {
  it('chunks words with delays', async () => {
    vi.useFakeTimers();
    const chunks = [];
    const onChunk = vi.fn((chunk) => chunks.push(chunk));
    const onDone = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: 'hello world' }),
      })
    );

    streamMessage([{ role: 'user', content: 'hi' }], onChunk, onDone);

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(chunks.join('')).toBe('hello world');
  });
});
```

## Error Testing

**Pattern for error handling:**

```javascript
describe('streamMessage', () => {
  it('calls onError for failed requests', async () => {
    const onError = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    await streamMessage(
      [{ role: 'user', content: 'hi' }],
      vi.fn(),
      vi.fn(),
      onError
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('API error: 500') })
    );
  });
});
```

## Coverage Goals

**Recommended targets:**
- Statements: 80%
- Branches: 75%
- Functions: 85%
- Lines: 80%

**Current status:** 0% (no tests)

**View Coverage (once implemented):**

```bash
npm run test:coverage
```

Vitest will generate HTML report in `coverage/` directory.

## Test Organization Structure

**Suggested directory layout:**

```
src/
├── __tests__/
│   ├── hooks/
│   │   └── useChat.test.js
│   ├── services/
│   │   └── claudeApi.test.js
│   └── components/
│       ├── ChatInput.test.jsx
│       ├── ChatWindow.test.jsx
│       ├── MessageBubble.test.jsx
│       └── TypingIndicator.test.jsx
├── components/
├── hooks/
├── services/
└── ...
```

Or co-located pattern:

```
src/
├── components/
│   ├── ChatInput.jsx
│   ├── ChatInput.test.jsx
│   └── ...
├── hooks/
│   ├── useChat.js
│   ├── useChat.test.js
│   └── ...
└── ...
```

## Configuration Template (when ready)

**vitest.config.js:**

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.planning/',
      ],
    },
  },
});
```

---

*Testing analysis: 2026-03-03*
