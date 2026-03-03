# Career Advisor

An AI-powered career coaching chat app built with React and the Anthropic API. The assistant draws on insights from 76 product leaders to help users navigate career transitions, evaluate opportunities, and think through their next move.

## Features

- Streaming chat UI with typing indicator
- Career-transitions persona and coaching frameworks injected into every system prompt
- Database of insights from 76 product leaders (guest-insights.md)
- Falls back to mock streaming responses when no API key is set

## Stack

- Vite + React
- Tailwind CSS v4
- Anthropic SDK (`@anthropic-ai/sdk`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:
   ```
   VITE_CLAUDE_API_KEY=sk-ant-...
   ```
   Get your key from [console.anthropic.com](https://console.anthropic.com).

3. Start the dev server:
   ```bash
   npm run dev
   ```

If `VITE_CLAUDE_API_KEY` is absent or set to `sk-ant-`, the app runs in mock mode — no API calls are made.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```
