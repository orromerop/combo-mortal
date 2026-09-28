const express = require("express");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3080;

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "Data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const PLATILLOS_PATH = path.join(DATA_DIR, "platillos.json");
const SEED_PATH = path.join(DATA_DIR, "pedidos.seed.json");
const STATE_PATH = path.join(DATA_DIR, "pedidos.json");

app.use(express.json({ limit: "2mb" }));
app.use(express.static(ROOT));

let writeQueue = Promise.resolve();

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function readJson(filePath, fallback) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return safeJsonParse(raw, fallback);
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(filePath, value) {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
  const temp = `${filePath}.tmp`;
  const text = JSON.stringify(value, null, 2);
  await fsp.writeFile(temp, text, "utf8");
  await fsp.rename(temp, filePath);
}

function validateState(maybe) {
  if (!maybe || typeof maybe !== "object") return false;
  if (!Array.isArray(maybe.pedidos)) return false;
  if (!Array.isArray(maybe.carrito)) return false;
  if (typeof maybe.secuencia !== "number") return false;
  return true;
}

function nuevoNumero(seq) {
  return "#A-2026-" + String(seq).padStart(6, "0");
}

function totales(items, impuesto) {
  const subtotal = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0);
  const tax = Math.round(subtotal * impuesto);
  return { subtotal, impuesto: tax, total: subtotal + tax };
}

function seedFromJson(seed, platillos, config) {
  const impuesto = Number(config.impuesto || 0.13);
  const secuencia = Number(seed.secuenciaInicial) || 1248;
  const pedidosSeed = Array.isArray(seed.pedidos) ? seed.pedidos : [];

  const pedidos = pedidosSeed
    .map((src) => {
      const seq = Number(src.numeroSecuencia);
      if (!seq) return null;

      const items = (src.items || [])
        .map((it) => {
          const platillo = platillos.find((p) => p.id === it.platilloId);
          if (!platillo) return null;
          return {
            platilloId: platillo.id,
            nombre: platillo.nombre,
            precio: platillo.precio,
            cantidad: Number(it.cantidad) || 1,
            estacion: platillo.estacion,
            estado: it.estado || "PENDIENTE",
          };
        })
        .filter(Boolean);

      if (!items.length) return null;

      const mins = Number(src.minutosAtras) || 0;
      const creadoEn = new Date(Date.now() - mins * 60000).toISOString();
      const totals = totales(items, impuesto);

      const pedido = {
        id: "demo-" + seq,
        numero: nuevoNumero(seq),
        creadoEn,
        estado: src.estado || "PENDIENTE",
        items,
        subtotal: totals.subtotal,
        impuesto: totals.impuesto,
        total: totals.total,
        metodoPago: src.metodoPago || "Tarjeta",
        historial: [],
      };

      if (pedido.estado === "ENTREGADO") {
        const deliveredMins = Number(src.entregadoMinutosAtras);
        pedido.entregadoEn = new Date(
          Date.now() - (Number.isFinite(deliveredMins) ? deliveredMins : 0) * 60000,
        ).toISOString();
      }

      return pedido;
    })
    .filter(Boolean);

  return {
    secuencia,
    pedidos,
    carrito: [],
  };
}

async function getBootstrap() {
  const [config, platillos, seed, existingState] = await Promise.all([
    readJson(CONFIG_PATH, {}),
    readJson(PLATILLOS_PATH, []),
    readJson(SEED_PATH, { secuenciaInicial: 1248, pedidos: [] }),
    readJson(STATE_PATH, null),
  ]);

  let state = existingState;
  if (!validateState(state)) {
    state = seedFromJson(seed, platillos, config);
    await writeJsonAtomic(STATE_PATH, state);
  }

  return { config, platillos, seed, state };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, now: new Date().toISOString() });
});

app.get("/api/bootstrap", async (_req, res) => {
  try {
    const payload = await getBootstrap();
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/state", async (_req, res) => {
  try {
    const payload = await getBootstrap();
    res.json(payload.state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/state", async (req, res) => {
  const nextState = req.body && req.body.state;
  if (!validateState(nextState)) {
    res.status(400).json({ error: "Estado invalido. Se requiere { secuencia, pedidos, carrito }." });
    return;
  }

  writeQueue = writeQueue.then(async () => {
    await writeJsonAtomic(STATE_PATH, nextState);
  });

  try {
    await writeQueue;
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("*", (req, res) => {
  const requested = path.join(ROOT, req.path);
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) {
    res.sendFile(requested);
    return;
  }
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`ComboMortalNuevo en http://localhost:${PORT}`);
});
