const https = require('https');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { canvasUrl, token, path: apiPath } = req.body;

  if (!canvasUrl || !token || !apiPath) {
    return res.status(400).json({ error: 'canvasUrl, token, and path are required' });
  }

  const target = new URL(apiPath, canvasUrl.replace(/\/$/, ''));

  return new Promise((resolve) => {
    const opts = {
      hostname: target.hostname,
      port: 443,
      path: target.pathname + target.search,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    };

    const apiReq = https.request(opts, (apiRes) => {
      let data = '';
      apiRes.on('data', (c) => (data += c));
      apiRes.on('end', () => {
        res.status(apiRes.statusCode)
          .setHeader('Content-Type', 'application/json')
          .send(data);
        resolve();
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });

    apiReq.end();
  });
};
