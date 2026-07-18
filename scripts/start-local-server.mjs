import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.MTF_LOCAL_PORT || 8000);
const logDir = join(root, '.codex', 'logs');
const logFile = join(logDir, 'local-server.out.log');
const serverScript = join(root, 'scripts', 'local-static-server.mjs');
const windowsLauncher = join(root, 'scripts', 'start-local-server.ps1');

function log(message) {
  try {
    mkdirSync(logDir, { recursive: true });
    appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
  } catch {
    // A running Codex hook may hold the log file open on Windows.
    // Server startup must not depend on diagnostic logging.
  }
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

if (process.platform === 'win32') {
  const result = spawnSync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    windowsLauncher,
  ], {
    cwd: root,
    stdio: 'ignore',
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    log(`MiniTankForge local server launch failed: ${result.error?.message || `exit ${result.status}`}`);
    process.exit(1);
  }
} else {
  const child = spawn(process.execPath, [serverScript], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
  });
  child.unref();
}

let listening = false;
for (let attempt = 0; attempt < 30; attempt += 1) {
  await new Promise(resolve => setTimeout(resolve, 100));
  if (await isListening()) {
    listening = true;
    break;
  }
}

if (!listening) {
  log(`MiniTankForge local server failed to listen on http://127.0.0.1:${port}/`);
  process.exit(1);
}

log(`MiniTankForge local server running on http://127.0.0.1:${port}/`);
