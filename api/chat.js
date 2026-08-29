export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required.' });
  }

  // Auto-intent routing logic
  let selectedModel = model;
  if (!model || model === 'auto') {
    const lower = prompt.toLowerCase();
    if (lower.includes('code') || lower.includes('bug') || lower.includes('script')) {
      selectedModel = 'anthropic/claude-3.5-sonnet';
    } else if (lower.includes('news') || lower.includes('search') || lower.includes('today')) {
      selectedModel = 'perplexity/sonar-reasoning';
    } else {
      selectedModel = 'openai/gpt-4o-mini';
    }
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dk-ai-platform.vercel.app',
        'X-Title': 'DK AI Platform'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(502).json({ error: data.error.message });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: 'Server connection error' });
  }
}
