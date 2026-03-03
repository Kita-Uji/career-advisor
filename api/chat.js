import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const MOCK_RESPONSE =
  "I'm your AI career advisor. It looks like the API key isn't configured yet — " +
  'but once it is, I can help you think through career transitions, evaluate opportunities, ' +
  'and build a plan for your next move.';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'sk-ant-') {
    return res.status(200).json({ text: MOCK_RESPONSE });
  }

  // Build system prompt from skill files
  const base = path.join(process.cwd(), '.claude', 'skills', 'career-transitions');
  const skillContent = fs.readFileSync(path.join(base, 'SKILL.md'), 'utf8');
  const insightsContent = fs.readFileSync(
    path.join(base, 'references', 'guest-insights.md'),
    'utf8'
  );

  const systemPrompt = `You are a career advisor helping people navigate career transitions.
Draw on the frameworks, principles, and guest insights below to give specific, actionable,
and empathetic guidance.

${skillContent}

---

## Full Guest Insights Database

${insightsContent}`;

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const text = message.content[0].text;
  return res.status(200).json({ text });
}
