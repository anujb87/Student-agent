const https = require('https');

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const path = req.url.split('?')[0].replace(/^\/api\/?/, '');

  // GET /api/config
  if (path === 'config' || path === '') {
    res.status(200).json({ hasServerKey: !!process.env.ANTHROPIC_API_KEY });
    return;
  }

  // POST /api/chat
  if (path === 'chat') {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
    let body;
    try { body = JSON.parse(await readBody(req)); } catch(e) { res.status(400).json({ error: 'Invalid JSON' }); return; }

    const { messages, system, apiKey, max_tokens } = body;
    const resolvedKey = process.env.ANTHROPIC_API_KEY || apiKey;
    if (!resolvedKey) { res.status(400).json({ error: 'API key required' }); return; }

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: max_tokens || 4000,
      system,
      messages,
    });

    return new Promise((resolve) => {
      const opts = {
        hostname: 'api.anthropic.com', port: 443, path: '/v1/messages', method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-api-key': resolvedKey,
          'anthropic-version': '2023-06-01',
        },
      };
      const apiReq = https.request(opts, (apiRes) => {
        let data = '';
        apiRes.on('data', c => data += c);
        apiRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) res.status(400).json({ error: json.error.message });
            else res.status(200).json({ content: json.content[0].text });
          } catch(e) { res.status(500).json({ error: e.message }); }
          resolve();
        });
      });
      apiReq.on('error', e => { res.status(500).json({ error: e.message }); resolve(); });
      apiReq.write(payload);
      apiReq.end();
    });
  }

  // POST /api/canvas
  if (path === 'canvas') {
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
    let body;
    try { body = JSON.parse(await readBody(req)); } catch(e) { res.status(400).json({ error: 'Invalid JSON' }); return; }

    const { canvasUrl, token, path: apiPath } = body;
    if (!canvasUrl || !token || !apiPath) { res.status(400).json({ error: 'canvasUrl, token, and path are required' }); return; }

    const target = new URL(apiPath, canvasUrl.replace(/\/$/, ''));
    return new Promise((resolve) => {
      const opts = {
        hostname: target.hostname, port: 443,
        path: target.pathname + target.search, method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      };
      const apiReq = https.request(opts, (apiRes) => {
        let data = '';
        apiRes.on('data', c => data += c);
        apiRes.on('end', () => {
          res.status(apiRes.statusCode).setHeader('Content-Type', 'application/json').send(data);
          resolve();
        });
      });
      apiReq.on('error', e => { res.status(500).json({ error: e.message }); resolve(); });
      apiReq.end();
    });
  }

  res.status(404).json({ error: 'Not found' });
};
