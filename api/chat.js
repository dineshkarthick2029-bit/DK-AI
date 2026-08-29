export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required.' });
  }

  // Use reliable free models on OpenRouter
  let selectedModel = 'google/gemini-2.0-flash-001';
  if (model === 'perplexity/sonar-reasoning') {
    selectedModel = 'meta-llama/llama-3.3-70b-instruct:free';
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://dk-ai-ten.vercel.app',
        'X-Title': 'DK AI Platform'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(502).json({ error: data.error.message || 'API Error' });
    }

    return res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: 'Server connection error' });
  }
}

