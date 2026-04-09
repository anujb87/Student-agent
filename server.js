const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;
const PUBLIC = path.join(__dirname, 'public');

// ── Load API key from .env file if present ────────────────────────────────────
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.trim().split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}
const SERVER_API_KEY = process.env.ANTHROPIC_API_KEY || null;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg'
};

async function readBody(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => res(body));
    req.on('error', rej);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url);

  // Tell the client whether the server already has an API key configured
  if (req.method === 'GET' && parsed.pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hasServerKey: !!SERVER_API_KEY }));
    return;
  }

  if (req.method === 'POST' && parsed.pathname === '/api/chat') {
    try {
      const body = JSON.parse(await readBody(req));
      const { messages, system, apiKey, max_tokens } = body;
      const resolvedKey = SERVER_API_KEY || apiKey;
      if (!resolvedKey) { res.writeHead(400); res.end(JSON.stringify({ error: 'API key required' })); return; }

      const payload = JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: max_tokens || 4000, system, messages });
      const opts = {
        hostname: 'api.anthropic.com', port: 443, path: '/v1/messages', method: 'POST',
        headers: {
          'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload),
          'x-api-key': resolvedKey, 'anthropic-version': '2023-06-01'
        }
      };

      const https = require('https');
      const apiReq = https.request(opts, (apiRes) => {
        let data = '';
        apiRes.on('data', c => data += c);
        apiRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) { res.writeHead(400, {'Content-Type':'application/json'}); res.end(JSON.stringify({ error: json.error.message })); }
            else { res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify({ content: json.content[0].text })); }
          } catch(e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
        });
      });
      apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      apiReq.write(payload);
      apiReq.end();
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  // Canvas API proxy — avoids CORS issues when calling the student's institution Canvas
  if (req.method === 'POST' && parsed.pathname === '/api/canvas') {
    try {
      const body   = JSON.parse(await readBody(req));
      const { canvasUrl, token, path: apiPath } = body;
      if (!canvasUrl || !token || !apiPath) { res.writeHead(400); res.end(JSON.stringify({ error: 'canvasUrl, token, and path are required' })); return; }
      const target = new URL(apiPath, canvasUrl.replace(/\/$/, ''));
      const https  = require('https');
      const opts   = {
        hostname: target.hostname, port: 443,
        path: target.pathname + target.search, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      };
      const apiReq = https.request(opts, (apiRes) => {
        let data = '';
        apiRes.on('data', c => data += c);
        apiRes.on('end', () => {
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(data);
        });
      });
      apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      apiReq.end();
    } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  if (!fs.existsSync(filePath)) filePath = path.join(PUBLIC, 'index.html');

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n🎓 Campus Agent running at http://localhost:${PORT}\n`);
  if (SERVER_API_KEY) {
    console.log('   ✅ API key loaded from .env — no login screen needed.\n');
  } else {
    console.log('   ℹ️  No .env file found. You can enter your API key in the app,');
    console.log('      or create prototype/.env with: ANTHROPIC_API_KEY=sk-ant-...\n');
  }
});
