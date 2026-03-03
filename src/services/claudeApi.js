export async function streamMessage(messages, onChunk, onDone, onError) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const { text } = await res.json();
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
    }

    onDone();
  } catch (err) {
    onError(err);
  }
}
