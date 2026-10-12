import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { appendFileSync, createReadStream, mkdirSync } from 'node:fs';

const root = process.cwd();
const port = Number(process.env.MTF_LOCAL_PORT || 8000);
const logDir = path.join(root, '.codex', 'logs');
const errorLog = path.join(logDir, 'local-server.err.log');
const orderConfirmationUrl = 'https://minitankforge.com/api/order-confirmation';
const maxApiRequestBytes = 18000;

function logError(error) {
  try {
    mkdirSync(logDir, { recursive: true });
    appendFileSync(errorLog, `${new Date().toISOString()} ${error?.stack || error}\n`);
  } catch {
    console.error(error);
  }
}

const types = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.csv', 'text/csv; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

function readRequestBody(req, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Request body is too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxyOrderConfirmation(req, res) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    send(res, 415, JSON.stringify({ error: 'The request must use JSON.' }), 'application/json; charset=utf-8');
    return;
  }

  let body;
  try {
    body = await readRequestBody(req, maxApiRequestBytes);
  } catch (error) {
    if (error.message === 'Request body is too large') {
      send(res, 413, JSON.stringify({ error: error.message }), 'application/json; charset=utf-8');
      return;
    }
    throw error;
  }

  const response = await fetch(orderConfirmationUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://minitankforge.com',
    },
    body,
  });
  const responseBody = Buffer.from(await response.arrayBuffer());
  res.writeHead(response.status, {
    'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(responseBody);
}

function safePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }

  const clean = decoded.replace(/^\/+/, '') || 'index.html';
  const resolved = path.resolve(root, clean);
  return resolved.startsWith(root + path.sep) || resolved === root ? resolved : null;
}

async function resolveFile(urlPath) {
  const requested = safePath(urlPath);
  if (!requested) return null;

  try {
    const stat = await fs.stat(requested);
    if (stat.isDirectory()) {
      const index = path.join(requested, 'index.html');
      try {
        await fs.access(index);
        return index;
      } catch {
        const siblingHtml = `${requested}.html`;
        try {
          await fs.access(siblingHtml);
          return siblingHtml;
        } catch {
          return null;
        }
      }
    }
    return requested;
  } catch {
    if (!path.extname(requested)) {
      const html = `${requested}.html`;
      try {
        await fs.access(html);
        return html;
      } catch {
        return null;
      }
    }
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    send(res, 400, 'Bad request');
    return;
  }

  const requestPath = req.url.split('?')[0];
  if (req.method === 'POST' && requestPath === '/api/order-confirmation') {
    try {
      await proxyOrderConfirmation(req, res);
    } catch (error) {
      logError(error);
      send(res, 502, JSON.stringify({ error: 'The live confirmation service could not be reached.' }), 'application/json; charset=utf-8');
    }
    return;
  }

  if (req.method !== 'GET') {
    send(res, 405, 'Method not allowed');
    return;
  }

  const file = await resolveFile(req.url);
  if (!file) {
    send(res, 404, 'Not found');
    return;
  }

  const type = types.get(path.extname(file).toLowerCase()) || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  const stream = createReadStream(file);
  stream.on('error', error => {
    logError(error);
    res.destroy(error);
  });
  stream.pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`MiniTankForge local server running at http://127.0.0.1:${port}/`);
});

server.on('error', error => {
  logError(error);
  process.exit(1);
});

process.on('uncaughtException', error => {
  logError(error);
  process.exit(1);
});
