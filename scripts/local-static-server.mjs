import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { appendFileSync, createReadStream, mkdirSync } from 'node:fs';

const root = process.cwd();
const port = Number(process.env.MTF_LOCAL_PORT || 8000);
const logDir = path.join(root, '.codex', 'logs');
const errorLog = path.join(logDir, 'local-server.err.log');

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
  if (!req.url || req.method !== 'GET') {
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
