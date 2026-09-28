const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { spawn } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'Data', 'pedidos.json');
const PORT = 3090;
const BASE_URL = `http://localhost:${PORT}`;

let serverProc = null;
let originalStateText = null;

async function waitForHealth(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Servidor de pruebas no respondió /api/health a tiempo');
}

async function putState(payload) {
  const res = await fetch(`${BASE_URL}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

test.before(async () => {
  originalStateText = await fs.readFile(STATE_PATH, 'utf8').catch(() => null);

  serverProc = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });

  await waitForHealth();
});

test.after(async () => {
  if (serverProc && !serverProc.killed) {
    serverProc.kill('SIGTERM');
  }

  if (originalStateText === null) {
    await fs.rm(STATE_PATH, { force: true });
  } else {
    await fs.writeFile(STATE_PATH, originalStateText, 'utf8');
  }
});

test('rechaza payload sin state (borde)', async () => {
  const out = await putState({});
  assert.equal(out.status, 400);
  assert.match(out.body.error || '', /Estado invalido/i);
});

test('rechaza state con estructura invalida (borde)', async () => {
  const out = await putState({ state: { secuencia: 'x', pedidos: {}, carrito: null } });
  assert.equal(out.status, 400);
  assert.match(out.body.error || '', /Estado invalido/i);
});

test('acepta state minimo valido y lo persiste', async () => {
  const next = { secuencia: 9001, pedidos: [], carrito: [] };
  const out = await putState({ state: next });
  assert.equal(out.status, 200);
  assert.equal(out.body.ok, true);

  const res = await fetch(`${BASE_URL}/api/state`);
  assert.equal(res.status, 200);
  const saved = await res.json();
  assert.equal(saved.secuencia, 9001);
  assert.deepEqual(saved.pedidos, []);
  assert.deepEqual(saved.carrito, []);
});

test('cola de escritura: dos PUT concurrentes terminan con ultimo estado', async () => {
  const s1 = { secuencia: 9100, pedidos: [], carrito: [] };
  const s2 = { secuencia: 9200, pedidos: [], carrito: [] };

  const [r1, r2] = await Promise.all([
    putState({ state: s1 }),
    putState({ state: s2 }),
  ]);

  assert.equal(r1.status, 200);
  assert.equal(r2.status, 200);

  const res = await fetch(`${BASE_URL}/api/state`);
  const current = await res.json();
  assert.equal(current.secuencia, 9200);
});

test('recupera estado cuando pedidos.json se corrompe (borde)', async () => {
  await fs.writeFile(STATE_PATH, '{"secuencia":', 'utf8');

  const res = await fetch(`${BASE_URL}/api/bootstrap`);
  assert.equal(res.status, 200);

  const payload = await res.json();
  assert.equal(typeof payload.state.secuencia, 'number');
  assert.equal(Array.isArray(payload.state.pedidos), true);
  assert.equal(Array.isArray(payload.state.carrito), true);
});
