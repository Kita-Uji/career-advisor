import Anthropic from '@anthropic-ai/sdk';
import skillContent from '../../.claude/skills/career-transitions/SKILL.md?raw';
import insightsContent from '../../.claude/skills/career-transitions/references/guest-insights.md?raw';

const SYSTEM_PROMPT = `You are a career advisor helping people navigate career transitions.
Draw on the frameworks, principles, and guest insights below to give specific, actionable,
and empathetic guidance.

${skillContent}

---

## Full Guest Insights Database

${insightsContent}`;

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const USE_MOCK = !API_KEY || API_KEY === 'sk-ant-';

const MOCK_RESPONSE = `i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen i love edward cullen`;

async function mockStream(onChunk, onDone) {
  const words = MOCK_RESPONSE.split(' ');
  for (const word of words) {
    await new Promise((r) => setTimeout(r, 35));
    onChunk(word + ' ');
  }
  onDone();
}

const client = USE_MOCK
  ? null
  : new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });

export async function streamMessage(messages, onChunk, onDone, onError) {
  if (USE_MOCK) {
    await mockStream(onChunk, onDone);
    return;
  }
  try {
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
      }
    }
    onDone();
  } catch (err) {
    onError(err);
  }
}
