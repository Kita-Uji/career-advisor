# Phase 1: UI Polish - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual polish for two component files only: `src/components/MessageBubble.jsx` and `src/components/ChatInput.jsx`. No new features, no layout restructuring, no header or color scheme changes.

</domain>

<decisions>
## Implementation Decisions

### Message Bubbles — Assistant
- Remove the CA avatar circle entirely (the `w-8 h-8 rounded-full bg-indigo-100` element and the `flex items-start gap-2.5` wrapper)
- Give assistant bubbles a soft `bg-indigo-50` background instead of `bg-white`
- Keep `shadow-sm`, `rounded-2xl rounded-tl-sm`, `px-4 py-2.5`, `text-sm leading-relaxed text-gray-800` — minimal changes only

### Message Bubbles — User
- No changes to user bubbles — indigo-600 background, current sizing and shape stay exactly as-is

### Input Area
- Replace the current `border-t border-gray-200 bg-white px-4 py-3` strip with an elevated floating card feel
- Card: `shadow-lg`, `rounded-2xl` — lifts visually off the background
- The input should feel like the focal point of the page

### Claude's Discretion
- Whether the textarea inside the card keeps its border or goes borderless (card acts as container)
- Whether the chat area background shifts from white to gray-50 to enhance the floating effect
- Exact padding/margin adjustments to achieve the "lifted" look
- Whether assistant bubble max-width expands slightly (currently 75%) without the avatar taking space

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/MessageBubble.jsx` (25 lines): Current structure — conditional render for user vs assistant. User: `flex justify-end mb-3`. Assistant: `flex items-start gap-2.5 mb-3` with avatar div + bubble div.
- `src/components/ChatInput.jsx` (55 lines): Outer wrapper `border-t border-gray-200 bg-white px-4 py-3`, inner `flex items-end gap-2` row with textarea + send button.

### Established Patterns
- Tailwind CSS v4 via `@tailwindcss/vite` — utility classes in JSX, no config file, no custom CSS
- Indigo accent palette (`indigo-50`, `indigo-100`, `indigo-400`, `indigo-600`, `indigo-700`)
- Gray neutral palette (`gray-200`, `gray-300`, `gray-800`)
- Container constraint: `max-w-3xl` in `App.jsx` — the input card stays within this

### Integration Points
- `ChatInput` renders inside `App.jsx` as fixed footer element — the outer wrapper is what needs the card treatment
- `MessageBubble` is rendered by `ChatWindow` — no changes needed to ChatWindow itself

</code_context>

<specifics>
## Specific Ideas

- User specifically chose the "Minimal / no avatar" direction from options shown (vs refined avatar, vs full-width assistant)
- User specifically chose "Elevated card" for input (vs wider input box, vs bolder send button)
- Core value: "calm, focused, trustworthy" — changes should reduce visual noise, not add it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-ui-polish*
*Context gathered: 2026-03-03*
