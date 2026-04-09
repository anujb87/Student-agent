const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system, apiKey, max_tokens } = req.body;
  const resolvedKey = process.env.ANTHROPIC_API_KEY || apiKey;

  if (!resolvedKey) {
    return res.status(400).json({ error: 'API key required' });
  }

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: max_tokens || 4000,
    system,
    messages,
  });

  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': resolvedKey,
        'anthropic-version': '2023-06-01',
      },
    };

    const apiReq = https.request(opts, (apiRes) => {
      let data = '';
      apiRes.on('data', (c) => (data += c));
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            res.status(400).json({ error: json.error.message });
          } else {
            res.status(200).json({ content: json.content[0].text });
          }
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
        resolve();
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    apiReq.write(payload);
    apiReq.end();
  });
};
