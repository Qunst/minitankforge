import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.MTF_LOCAL_PORT || 8000);
const logDir = join(root, '.codex', 'logs');
const logFile = join(logDir, 'local-server.out.log');
const serverScript = join(root, 'scripts', 'local-static-server.mjs');

function log(message) {
  mkdirSync(logDir, { recursive: true });
  appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
}

function isListening() {
  return new Promise(resolve => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const done = value => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(200);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

if (await isListening()) {
  process.exit(0);
}

if (process.argv.includes('--check-only')) {
  process.exit(1);
}

const startCommand = `start "" /min "${process.execPath}" "${serverScript}"`;
const child = spawn('cmd.exe', ['/d', '/s', '/c', startCommand], {
  cwd: root,
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
});

child.unref();
log(`MiniTankForge local server requested on http://127.0.0.1:${port}/`);
