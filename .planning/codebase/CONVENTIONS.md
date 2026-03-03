# Coding Conventions

**Analysis Date:** 2026-03-03

## Naming Patterns

**Files:**
- React components: PascalCase + `.jsx` extension (e.g., `ChatWindow.jsx`, `MessageBubble.jsx`)
- Utility/hook functions: camelCase + `.js` extension (e.g., `useChat.js`, `claudeApi.js`)
- Service modules: camelCase + `.js` extension (e.g., `claudeApi.js`)
- CSS files: match component name or global scope (e.g., `App.css`, `index.css`)

**Functions:**
- React components: PascalCase (e.g., `ChatWindow()`, `MessageBubble()`)
- React hooks: camelCase with `use` prefix (e.g., `useChat()`)
- Exported utility functions: camelCase (e.g., `streamMessage()`, `makeId()`)
- Internal helper functions: camelCase (e.g., `submit()`, `handleKeyDown()`)

**Variables:**
- State: camelCase (e.g., `messages`, `isStreaming`, `error`, `text`)
- Props: camelCase (e.g., `onSend`, `isStreaming`, `message`)
- DOM references: camelCase with `Ref` suffix (e.g., `textareaRef`, `bottomRef`)
- Constants: UPPER_CASE for immutable values (e.g., `GREETING`)
- Boolean flags: `is` or `show` prefix (e.g., `isStreaming`, `showTypingIndicator`)

**Types:**
- No TypeScript in use; JSDoc types available but not consistently applied

## Code Style

**Formatting:**
- No explicit formatter configured; code follows ES2020 and JSX standards
- Indentation: 2 spaces (inferred from source files)
- Line breaks: Functions use concise formatting with no trailing semicolons in most cases

**Linting:**
- Tool: ESLint (v9.39.1)
- Config: `eslint.config.js` (flat config format)
- Extends: `@eslint/js` recommended rules + `react-hooks` recommended + `react-refresh` Vite preset
- Key rules:
  - `no-unused-vars`: Error, but allows variables matching `^[A-Z_]` (for React components and constants)
- Target: ES2020 with JSX support enabled
- Browser globals enabled

## Import Organization

**Order:**
1. React core imports (e.g., `import { useState, useRef } from 'react'`)
2. Component/hook imports from local paths (e.g., `import App from './App.jsx'`)
3. Service/utility imports (e.g., `import { streamMessage } from '../services/claudeApi'`)

**Path Aliases:**
- Not configured; uses relative paths throughout (e.g., `../services/`, `./components/`, `../hooks/`)

**Example (from `src/App.jsx`):**
```javascript
import { useChat } from './hooks/useChat';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
```

## Error Handling

**Patterns:**
- Try-catch blocks used in async functions (see `streamMessage()` in `src/services/claudeApi.js`)
- Errors captured and passed to `onError` callback for consumer handling
- UI error state managed in hook via `useState([error, setError])`
- Error messages displayed in conditional banner in `src/App.jsx` (lines 20-24):
  ```jsx
  {error && (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700 flex-shrink-0">
      {error}
    </div>
  )}
  ```
- Default user-friendly message provided: `'Something went wrong. Please try again.'`

## Logging

**Framework:** Console (no dedicated logging framework)

**Patterns:**
- No logging observed in production code
- Error messages passed via callback pattern rather than logged
- Console output would be suitable for debugging during development

## Comments

**When to Comment:**
- Single-line comments used sparingly for non-obvious logic
- Example in `src/hooks/useChat.js` (line 30): `// Build API messages array (strip internal id field)` — explains purpose of message transformation

**JSDoc/TSDoc:**
- Not used; no TypeScript configuration
- Would be appropriate for function signatures if TypeDoc support added

## Function Design

**Size:** Small, single-responsibility functions preferred
- `useChat()`: ~56 lines (hook with state + side-effect)
- `streamMessage()`: ~25 lines (API call with streaming)
- `MessageBubble()`: ~25 lines (presentational component)
- Component render methods: 5-30 lines typical

**Parameters:**
- Props destructured at function signature (e.g., `function ChatWindow({ messages, isStreaming })`)
- Callbacks passed as props (e.g., `onSend`, `onChunk`, `onDone`, `onError`)
- No positional-only arguments; all named parameters

**Return Values:**
- Components return JSX elements directly
- Hooks return objects with state/methods (e.g., `{ messages, isStreaming, error, sendMessage }`)
- Async functions return Promises; streaming functions use callbacks instead

## Module Design

**Exports:**
- Default exports used for React components and hooks:
  ```javascript
  export default function ChatWindow({ messages, isStreaming }) { ... }
  export function useChat() { ... }
  ```
- Named exports used for utility functions:
  ```javascript
  export async function streamMessage(...) { ... }
  ```

**Barrel Files:**
- Not used; imports reference specific files directly
- `src/main.jsx` serves as app entry point, not as barrel file

## React Patterns

**Hooks:**
- `useState()` for component state (messages, isStreaming, error, text)
- `useCallback()` for memoized callbacks to prevent re-renders (`sendMessage` in `useChat`)
- `useRef()` for DOM element references (textarea, scroll anchor)
- `useEffect()` for side effects (auto-scroll, textarea resize)

**Component Structure:**
- Functional components exclusively (no class components)
- Props destructured in function parameters
- Event handlers defined as internal functions or callbacks
- Example from `src/components/ChatInput.jsx`:
  ```javascript
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }
  ```

**State Management:**
- Centralized in `useChat()` hook; consumed by `App.jsx`
- Message list includes internal `id` field (stripped before API calls)
- Error state persists in UI until new message sent (cleared via `setError(null)`)

## Styling

**Framework:** Tailwind CSS v4 with `@tailwindcss/vite` plugin

**Patterns:**
- Utility classes applied directly in JSX className attributes
- No CSS modules; global CSS reset in `src/index.css`
- Color scheme: indigo accent colors with gray neutral palette
- Responsive design via flex utilities; `max-w-3xl` container constraint in `App.jsx`
- Conditional classes for state (e.g., `disabled:opacity-50` for disabled button)

**Example (from `src/components/ChatInput.jsx`):**
```jsx
<textarea
  className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 overflow-hidden"
/>
```

---

*Convention analysis: 2026-03-03*
