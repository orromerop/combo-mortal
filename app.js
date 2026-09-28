let PLATILLOS = [];
let SEED_DATA = { secuenciaInicial: 1248, pedidos: [] };
const API_BASE = "./api";

let CONFIG = {
  impuesto: 0.13,
  storageKey: "combo-mortal-html-v2",
  monedaLocale: "es-CR",
  version: 1,
};

const ETIQUETA_PEDIDO = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparacion",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
};

const ETIQUETA_ITEM = {
  PENDIENTE: "Pendiente",
  PREPARACION: "En preparacion",
  LISTO: "Listo",
};

const app = document.getElementById("app");
const cartCount = document.getElementById("cart-count");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

const ui = {
  filtro: "todos",
  cantidadesMenu: {},
  agregado: null,
  metodoPago: "Tarjeta",
  datosPago: "",
  checkoutError: "",
  procesando: false,
  seleccionCocina: null,
  borradorCocina: {},
  avisoCocina: "",
  filtroAdmin: "TODOS",
  desdeAdmin: "",
  hastaAdmin: "",
  confirmarEntregaId: null,
  startupError: "",
};

let state = null;
let persistQueue = Promise.resolve();

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Fallo de comunicacion con API");
  }
  return data;
}

function apiGet(path) {
  return api(path);
}

function apiPut(path, body) {
  return api(path, { method: "PUT", body: JSON.stringify(body) });
}

async function loadJson(path) {
  if (typeof window.fetch === "function") {
    try {
      const res = await window.fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo leer " + path);
      return await res.json();
    } catch {
      /* fallback a XHR */
    }
  }

  try {
    const text = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
          resolve(xhr.responseText);
        } else {
          reject(new Error("No se pudo leer " + path));
        }
      };
      xhr.onerror = () => reject(new Error("No se pudo leer " + path));
      xhr.send();
    });
    return JSON.parse(text);
  } catch (error) {
    throw error;
  }
}

async function boot() {
  app.innerHTML = '<section class="panel"><h1 class="page-title">Cargando datos</h1><p class="meta">Leyendo archivos de Data...</p></section>';

  try {
    const bootstrap = await apiGet("/bootstrap");
    const config = bootstrap.config || {};
    const platillos = bootstrap.platillos || [];
    const seed = bootstrap.seed || SEED_DATA;
    const estado = bootstrap.state || null;

    CONFIG = { ...CONFIG, ...(config || {}) };
    PLATILLOS = Array.isArray(platillos) ? platillos : [];
    SEED_DATA = seed && typeof seed === "object" ? seed : SEED_DATA;

    if (!PLATILLOS.length) {
      throw new Error("Data/platillos.json vacio o invalido.");
    }

    state = estado && validateState(estado) ? estado : { ...seedFromJson(), carrito: [] };

    if (!location.hash) location.hash = "menu";
    render();
  } catch (error) {
    ui.startupError = "No se pudo iniciar la API local. Inicia el servidor con npm install y npm start dentro de ComboMortalNuevo.";
    console.error(error);
    render();
  }
}

function saveState() {
  if (!state) return;
  const snapshot = JSON.parse(JSON.stringify(state));
  persistQueue = persistQueue
    .then(() => apiPut("/state", { state: snapshot }))
    .catch((error) => {
      console.error("No se pudo guardar estado en Data/pedidos.json", error);
    });
}

function validateState(maybe) {
  if (!maybe || typeof maybe !== "object") return false;
  if (!Array.isArray(maybe.pedidos)) return false;
  if (!Array.isArray(maybe.carrito)) return false;
  if (typeof maybe.secuencia !== "number") return false;
  return true;
}

function seedFromJson() {
  const secuencia = Number(SEED_DATA.secuenciaInicial) || 1248;
  const pedidosSeed = Array.isArray(SEED_DATA.pedidos) ? SEED_DATA.pedidos : [];

  const pedidos = pedidosSeed
    .map((s) => {
      const seq = Number(s.numeroSecuencia);
      if (!seq) return null;

      const items = (s.items || [])
        .map((it) => {
          const p = findPlatillo(it.platilloId);
          if (!p) return null;
          return item(p, Number(it.cantidad) || 1, it.estado || "PENDIENTE");
        })
        .filter(Boolean);

      if (!items.length) return null;

      const pedido = pedidoDemo(seq, Number(s.minutosAtras) || 0, items, s.estado || "PENDIENTE");
      pedido.metodoPago = s.metodoPago || "Tarjeta";
      if (pedido.estado === "ENTREGADO") {
        const m = Number(s.entregadoMinutosAtras);
        pedido.entregadoEn = new Date(Date.now() - (Number.isFinite(m) ? m : 0) * 60000).toISOString();
      }
      return pedido;
    })
    .filter(Boolean);

  return { pedidos, secuencia };
}

function findPlatillo(id) {
  return PLATILLOS.find((x) => x.id === id);
}

function item(platillo, cantidad, estado = "PENDIENTE") {
  return {
    platilloId: platillo.id,
    nombre: platillo.nombre,
    precio: platillo.precio,
    cantidad,
    estacion: platillo.estacion,
    estado,
  };
}

function pedidoDemo(seq, minutosAtras, items, estado) {
  const creadoEn = new Date(Date.now() - minutosAtras * 60000).toISOString();
  const t = totales(items);
  return {
    id: "demo-" + seq,
    numero: nuevoNumero(seq),
    creadoEn,
    estado,
    items,
    subtotal: t.subtotal,
    impuesto: t.impuesto,
    total: t.total,
    metodoPago: "Tarjeta",
    historial: [],
  };
}

function nuevoNumero(seq) {
  return "#A-2026-" + String(seq).padStart(6, "0");
}

function totales(items) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const impuesto = Math.round(subtotal * Number(CONFIG.impuesto || 0.13));
  return { subtotal, impuesto, total: subtotal + impuesto };
}

function crc(n) {
  return "CRC " + Math.round(n).toLocaleString(CONFIG.monedaLocale || "es-CR");
}

function hora(iso) {
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
}

function fecha(iso) {
  return new Date(iso).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function cartLineas() {
  if (!state) return [];
  return state.carrito
    .map((linea) => {
      const platillo = findPlatillo(linea.platilloId);
      if (!platillo) return null;
      return {
        platilloId: platillo.id,
        nombre: platillo.nombre,
        precio: platillo.precio,
        cantidad: linea.cantidad,
        estacion: platillo.estacion,
        estado: "PENDIENTE",
        platillo,
      };
    })
    .filter(Boolean);
}

function cartTotales() {
  const lineas = cartLineas();
  const t = totales(lineas);
  return {
    ...t,
    items: lineas.reduce((n, i) => n + i.cantidad, 0),
  };
}

function agregarCarrito(platilloId, cantidad) {
  const idx = state.carrito.findIndex((l) => l.platilloId === platilloId);
  if (idx >= 0) {
    state.carrito[idx].cantidad += cantidad;
  } else {
    state.carrito.push({ platilloId, cantidad });
  }
  saveState();
}

function setCantidadCarrito(platilloId, cantidad) {
  if (cantidad <= 0) {
    state.carrito = state.carrito.filter((x) => x.platilloId !== platilloId);
  } else {
    state.carrito = state.carrito.map((x) =>
      x.platilloId === platilloId ? { ...x, cantidad } : x,
    );
  }
  saveState();
}

function quitarCarrito(platilloId) {
  state.carrito = state.carrito.filter((x) => x.platilloId !== platilloId);
  saveState();
}

function crearPedido(metodoPago) {
  const items = cartLineas().map(({ platillo: _p, ...rest }) => rest);
  const t = totales(items);
  const pedido = {
    id: crypto.randomUUID(),
    numero: nuevoNumero(state.secuencia),
    creadoEn: new Date().toISOString(),
    estado: "PENDIENTE",
    items,
    subtotal: t.subtotal,
    impuesto: t.impuesto,
    total: t.total,
    metodoPago,
    historial: [],
  };
  state.pedidos.unshift(pedido);
  state.secuencia += 1;
  state.carrito = [];
  saveState();
  return pedido;
}

function buscarPedido(numeroOId) {
  return state.pedidos.find(
    (p) => p.id === numeroOId || p.numero === numeroOId || p.numero.replace("#", "") === numeroOId,
  );
}

function transicionesValidas(actual) {
  if (actual === "PENDIENTE") return ["PREPARACION", "LISTO"];
  if (actual === "PREPARACION") return ["LISTO"];
  return [];
}

function recalcularEstadoPedido(pedido) {
  if (pedido.estado === "ENTREGADO") return "ENTREGADO";
  const todosListos = pedido.items.every((i) => i.estado === "LISTO");
  const alguno = pedido.items.some((i) => i.estado !== "PENDIENTE");
  if (todosListos) return "LISTO";
  if (alguno) return "EN_PREPARACION";
  return "PENDIENTE";
}

function cambiarEstadoItemPedido(pedidoId, itemIndex, nuevoEstado, usuario) {
  const pedido = state.pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return;
  const anterior = pedido.items[itemIndex];
  if (!anterior) return;
  pedido.items[itemIndex] = { ...anterior, estado: nuevoEstado };
  pedido.estado = recalcularEstadoPedido(pedido);
  pedido.historial.push({
    ts: new Date().toISOString(),
    item: anterior.nombre,
    de: anterior.estado,
    a: nuevoEstado,
    usuario,
  });
  saveState();
}

function marcarEntregado(pedidoId) {
  const pedido = state.pedidos.find((p) => p.id === pedidoId);
  if (!pedido) return;
  pedido.estado = "ENTREGADO";
  pedido.entregadoEn = new Date().toISOString();
  saveState();
}

function getRoute() {
  const raw = location.hash.replace("#", "").trim();
  if (!raw) return { view: "menu" };
  if (raw.startsWith("orden/")) {
    return { view: "orden", numero: decodeURIComponent(raw.slice("orden/".length)) };
  }
  if (["menu", "checkout", "cocina", "admin"].includes(raw)) return { view: raw };
  return { view: "menu" };
}

function setRoute(view) {
  location.hash = view;
}

function setOrderRoute(numero) {
  location.hash = "orden/" + encodeURIComponent(numero.replace("#", ""));
}

function updateTopbar() {
  const route = getRoute();
  document.querySelectorAll("[data-nav]").forEach((el) => {
    const isActive = el.dataset.nav === route.view;
    el.classList.toggle("active", isActive);
  });
  cartCount.textContent = String(state ? cartTotales().items : 0);
}

function viewMenu() {
  const lista = PLATILLOS.filter((p) => {
    if (ui.filtro === "todos") return true;
    if (ui.filtro === "disponibles") return p.disponible;
    return !p.disponible;
  });
  const resumen = cartTotales();

  return `
    <section class="hero">
      <p class="eyebrow">Soda & Grill · Costa Rica</p>
      <h1>Menu de platillos</h1>
      <p>Escoge lo tuyo, ajusta cantidades y mira el subtotal antes de pagar. Lo agotado se muestra, pero no se puede seleccionar.</p>
    </section>

    <div class="row spaced">
      <span class="meta">Filtro:</span>
      ${[
        ["todos", "Todos"],
        ["disponibles", "Disponibles"],
        ["no-disponibles", "No disponibles"],
      ]
        .map(
          ([value, label]) =>
            `<button class="pill ${ui.filtro === value ? "active" : ""}" data-action="menu-filtro" data-value="${value}">${label}</button>`,
        )
        .join("")}
    </div>

    <section class="cards">
      ${lista
        .map((p) => {
          const cantidad = Math.max(1, Math.min(20, ui.cantidadesMenu[p.id] || 1));
          return `
            <article class="card ${p.disponible ? "" : "dim"}">
              <div class="card-head">
                <h3>${p.nombre}</h3>
                <span class="badge ${p.disponible ? "ok" : "no"}">${p.disponible ? "Disponible" : "Agotado"}</span>
              </div>
              <p class="desc">${p.descripcion}</p>
              <div class="price-row">
                <p class="price">${crc(p.precio)}</p>
                <button class="thumb-btn" data-action="foto" data-src="${p.foto}" data-alt="Foto de ${p.nombre}">
                  <img src="${p.foto}" alt="Foto de ${p.nombre}" loading="lazy" />
                </button>
              </div>
              <p class="station">Estacion: ${p.estacion}</p>
              ${
                p.disponible
                  ? `
                <div class="qty-row">
                  <div class="qty">
                    <button data-action="menu-cant" data-id="${p.id}" data-delta="-1">-</button>
                    <strong>${cantidad}</strong>
                    <button data-action="menu-cant" data-id="${p.id}" data-delta="1">+</button>
                  </div>
                  <button class="btn" data-action="menu-add" data-id="${p.id}">${ui.agregado === p.id ? "Agregado" : "Agregar"}</button>
                </div>
                `
                  : `<button class="btn-ghost" disabled>No seleccionable</button>`
              }
            </article>
          `;
        })
        .join("")}
    </section>

    ${
      resumen.items > 0
        ? `
      <section class="notice">
        <div>
          <p class="meta">Resumen rapido</p>
          <strong>${resumen.items} articulos - Subtotal ${crc(resumen.subtotal)}</strong>
        </div>
        <button class="btn" data-action="go-checkout">Ver pedido y pagar</button>
      </section>
    `
        : ""
    }
  `;
}

function viewCheckout() {
  const lineas = cartLineas();
  const vacio = lineas.length === 0;
  const t = cartTotales();

  return `
    <section>
      <h1 class="page-title">Checkout</h1>
      <p class="meta">Revisa tu pedido y confirma el pago. El impuesto de venta se calcula automaticamente.</p>
      <div class="grid2">
        <section class="panel">
          <h2>Resumen del pedido</h2>
          ${
            vacio
              ? `<div class="stack spaced"><p class="meta">Tu pedido esta vacio.</p><button class="btn" data-action="go-menu">Ir al menu</button></div>`
              : `
            <div class="stack spaced">
              ${lineas
                .map(
                  (l) => `
                <div class="line-item">
                  <div><strong>${l.nombre}</strong><p class="meta">${crc(l.precio)} c/u</p></div>
                  <div class="qty">
                    <button data-action="checkout-cant" data-id="${l.platilloId}" data-delta="-1">-</button>
                    <strong>${l.cantidad}</strong>
                    <button data-action="checkout-cant" data-id="${l.platilloId}" data-delta="1">+</button>
                  </div>
                  <strong>${crc(l.precio * l.cantidad)}</strong>
                  <button class="btn-danger" data-action="checkout-rm" data-id="${l.platilloId}">Quitar</button>
                </div>
              `,
                )
                .join("")}
            </div>`
          }
          <div class="totals">
            <p><span>Subtotal</span><strong>${crc(t.subtotal)}</strong></p>
            <p><span>Impuesto</span><strong>${crc(t.impuesto)}</strong></p>
            <p class="total"><span>Total</span><strong>${crc(t.total)}</strong></p>
          </div>
        </section>

        <section class="panel">
          <h2>Metodo de pago</h2>
          <div class="stack spaced">
            <label><input type="radio" name="metodo" value="Tarjeta" ${ui.metodoPago === "Tarjeta" ? "checked" : ""} data-action="metodo-pago" /> Tarjeta</label>
            <label><input type="radio" name="metodo" value="SINPE" ${ui.metodoPago === "SINPE" ? "checked" : ""} data-action="metodo-pago" /> SINPE Movil</label>
            <label><input type="radio" name="metodo" value="Efectivo" ${ui.metodoPago === "Efectivo" ? "checked" : ""} data-action="metodo-pago" /> Efectivo en caja</label>
          </div>
          ${
            ui.metodoPago === "Efectivo"
              ? ""
              : `<label class="spaced">${ui.metodoPago === "Tarjeta" ? "Numero de tarjeta" : "Telefono SINPE"}<input type="text" data-action="datos-pago" value="${ui.datosPago}" placeholder="${ui.metodoPago === "Tarjeta" ? "4111 1111 1111 1111" : "8888 8888"}" /></label>`
          }
          ${ui.checkoutError ? `<p class="error">${ui.checkoutError}</p>` : ""}
          <button class="btn spaced" data-action="checkout-confirm" ${ui.procesando ? "disabled" : ""}>${ui.procesando ? "Procesando pago..." : "Confirmar pago - " + crc(t.total)}</button>
          <p class="meta">Pago registrado en archivo JSON local.</p>
        </section>
      </div>
    </section>
  `;
}

function viewOrden(numero) {
  const pedido = buscarPedido("#" + numero) || buscarPedido(numero);
  if (!pedido) {
    return `<section class="panel"><h1 class="page-title">Orden no encontrada</h1><p class="meta">No hay ninguna orden con el numero #${numero}.</p><button class="btn spaced" data-action="go-menu">Volver al menu</button></section>`;
  }

  return `
    <section class="order-ok">
      <p class="meta">Transaccion exitosa</p>
      <h1 class="page-title">${pedido.numero}</h1>
      <p class="meta">${fecha(pedido.creadoEn)} - ${hora(pedido.creadoEn)} - Pago con ${pedido.metodoPago}</p>
      <span class="status ${pedido.estado}">${ETIQUETA_PEDIDO[pedido.estado]}</span>
    </section>

    <section class="panel spaced">
      <h2>Detalle</h2>
      <div class="stack spaced">
        ${pedido.items
          .map(
            (it) => `<div class="line-item"><strong>${it.cantidad}x ${it.nombre}</strong><span class="status ${it.estado}">${ETIQUETA_ITEM[it.estado]}</span><strong>${crc(it.precio * it.cantidad)}</strong></div>`,
          )
          .join("")}
      </div>
      <div class="totals">
        <p><span>Subtotal</span><strong>${crc(pedido.subtotal)}</strong></p>
        <p><span>Impuesto</span><strong>${crc(pedido.impuesto)}</strong></p>
        <p class="total"><span>Total</span><strong>${crc(pedido.total)}</strong></p>
      </div>
      ${pedido.entregadoEn ? `<p class="meta">Entregado a las ${hora(pedido.entregadoEn)}</p>` : ""}
    </section>

    <div class="row spaced">
      <button class="btn" data-action="go-menu">Pedir otra cosa</button>
      <button class="btn-ghost" data-action="go-cocina">Ver panel de cocina</button>
    </div>
  `;
}

function viewCocina() {
  const activos = state.pedidos
    .filter((p) => p.estado === "PENDIENTE" || p.estado === "EN_PREPARACION")
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));

  if (!ui.seleccionCocina && activos[0]) ui.seleccionCocina = activos[0].id;
  const pedido = state.pedidos.find((p) => p.id === ui.seleccionCocina) || activos[0];

  if (activos.length === 0) {
    return '<section><h1 class="page-title">Panel de cocina</h1><p class="meta">No hay ordenes nuevas por ahora.</p></section>';
  }

  return `
    <section>
      <h1 class="page-title">Panel de cocina</h1>
      <p class="meta">Pedidos nuevos en orden de llegada.</p>

      <div class="columns">
        <section class="panel list-buttons">
          <h2>Pedidos nuevos (${activos.length})</h2>
          <div class="spaced">
            ${activos
              .map(
                (p) => `<button class="${pedido && p.id === pedido.id ? "active" : ""}" data-action="cocina-select" data-id="${p.id}"><strong>${p.numero}</strong><br /><span class="meta">${hora(p.creadoEn)} - ${p.items.reduce((n, i) => n + i.cantidad, 0)} articulos</span></button>`,
              )
              .join("")}
          </div>
        </section>

        <section class="panel">
          <h2>Detalle ${pedido.numero}</h2>
          <span class="status ${pedido.estado}">${ETIQUETA_PEDIDO[pedido.estado]}</span>
          <div class="stack spaced">
            ${pedido.items
              .map((it, idx) => {
                const options = transicionesValidas(it.estado);
                const key = `${pedido.id}-${idx}`;
                const selected = ui.borradorCocina[key] || options[0] || "";
                return `
                  <div class="panel">
                    <div class="line-item"><div><strong>${it.cantidad}x ${it.nombre}</strong><p class="meta">Estacion: ${it.estacion}</p></div><span class="status ${it.estado}">${ETIQUETA_ITEM[it.estado]}</span></div>
                    ${
                      options.length
                        ? `<div class="row spaced"><select data-action="cocina-draft" data-key="${key}">${options.map((op) => `<option value="${op}" ${selected === op ? "selected" : ""}>${ETIQUETA_ITEM[op]}</option>`).join("")}</select><button class="btn-ok" data-action="cocina-save" data-id="${pedido.id}" data-index="${idx}" data-key="${key}">Guardar</button></div>`
                        : '<p class="meta spaced">Sin cambios posibles.</p>'
                    }
                  </div>
                `;
              })
              .join("")}
          </div>
          ${ui.avisoCocina ? `<p class="success spaced">${ui.avisoCocina}</p>` : ""}
        </section>
      </div>
    </section>
  `;
}

function inRange(iso) {
  const d = iso.slice(0, 10);
  if (ui.desdeAdmin && d < ui.desdeAdmin) return false;
  if (ui.hastaAdmin && d > ui.hastaAdmin) return false;
  return true;
}

function adminReporte(base) {
  const porPlatillo = new Map();
  let total = 0;
  base.forEach((p) => {
    total += p.total;
    p.items.forEach((it) => {
      const prev = porPlatillo.get(it.nombre) || { unidades: 0, ingreso: 0 };
      porPlatillo.set(it.nombre, {
        unidades: prev.unidades + it.cantidad,
        ingreso: prev.ingreso + it.precio * it.cantidad,
      });
    });
  });
  return {
    total,
    pedidos: base.length,
    filas: [...porPlatillo.entries()]
      .map(([nombre, v]) => ({ nombre, ...v }))
      .sort((a, b) => b.ingreso - a.ingreso),
  };
}

function viewAdmin() {
  const lista = state.pedidos
    .filter((p) => (ui.filtroAdmin === "TODOS" ? true : p.estado === ui.filtroAdmin))
    .filter((p) => inRange(p.creadoEn))
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));

  const base = state.pedidos.filter((p) => inRange(p.creadoEn));
  const reporte = adminReporte(base);

  return `
    <section>
      <div class="row" style="justify-content:space-between;align-items:center;"><h1 class="page-title">Administracion</h1><span class="meta">${fecha(new Date().toISOString())}</span></div>

      <section class="panel spaced">
        <h2>Filtros de pedidos</h2>
        <div class="row spaced">
          ${["TODOS", "PENDIENTE", "EN_PREPARACION", "LISTO", "ENTREGADO"].map((e) => `<button class="pill ${ui.filtroAdmin === e ? "active" : ""}" data-action="admin-filtro" data-value="${e}">${e === "TODOS" ? "Todos" : ETIQUETA_PEDIDO[e]}</button>`).join("")}
        </div>
        <div class="row spaced"><label>Desde<input type="date" value="${ui.desdeAdmin}" data-action="admin-desde" /></label><label>Hasta<input type="date" value="${ui.hastaAdmin}" data-action="admin-hasta" /></label></div>
      </section>

      <section class="panel spaced">
        <h2>Tabla de pedidos (${lista.length})</h2>
        <div class="table-wrap spaced">
          <table>
            <thead><tr><th>Orden</th><th>Hora</th><th>Estado</th><th>Total</th><th>Accion</th></tr></thead>
            <tbody>
              ${lista.map((p) => {
                const confirm = ui.confirmarEntregaId === p.id;
                return `
                    <tr>
                      <td>${p.numero}</td>
                      <td>${hora(p.creadoEn)}</td>
                      <td><span class="status ${p.estado}">${ETIQUETA_PEDIDO[p.estado]}</span>${p.entregadoEn ? ` <span class="meta">entrega ${hora(p.entregadoEn)}</span>` : ""}</td>
                      <td>${crc(p.total)}</td>
                      <td>${p.estado === "LISTO" ? `<button class="btn-sec" data-action="admin-confirm" data-id="${p.id}">Marcar entregado</button>` : `<button class="btn-ghost" data-action="admin-open" data-numero="${p.numero}">Ver detalle</button>`}</td>
                    </tr>
                    ${confirm ? `<tr><td colspan="5"><div class="row"><span>Confirmar entrega de <strong>${p.numero}</strong>?</span><button class="btn-ok" data-action="admin-yes" data-id="${p.id}">Si, entregar</button><button class="btn-ghost" data-action="admin-no">No</button></div></td></tr>` : ""}
                  `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel spaced">
        <div class="row" style="justify-content:space-between;align-items:center;"><h2>Reportes de ingresos</h2><div class="row"><button class="btn-ghost" data-action="admin-export">Exportar CSV</button><button class="btn-ghost" data-action="admin-export-state">Exportar respaldo</button><button class="btn-ghost" data-action="admin-import-state-click">Importar respaldo</button></div><input type="file" id="import-state-file" data-action="admin-import-state-file" accept="application/json" style="display:none" /></div>

        <div class="grid2 spaced" style="grid-template-columns:1fr 1fr;"><div class="panel"><p class="meta">Ingreso total del rango</p><h3 class="price" style="font-size:42px;">${crc(reporte.total)}</h3></div><div class="panel"><p class="meta">Pedidos en el rango</p><h3 class="price" style="font-size:42px;">${reporte.pedidos}</h3></div></div>

        <div class="table-wrap spaced"><table><thead><tr><th>Por platillo</th><th>Unidades</th><th>Ingreso</th></tr></thead><tbody>${reporte.filas.map((f) => `<tr><td>${f.nombre}</td><td>${f.unidades}</td><td>${crc(f.ingreso)}</td></tr>`).join("")}</tbody></table></div>
      </section>
    </section>
  `;
}

function render() {
  updateTopbar();

  if (ui.startupError) {
    app.innerHTML = `<section class="panel"><h1 class="page-title">Error de datos</h1><p class="error">${ui.startupError}</p></section>`;
    return;
  }

  if (!state) {
    app.innerHTML = '<section class="panel"><h1 class="page-title">Cargando...</h1></section>';
    return;
  }

  const route = getRoute();
  if (route.view === "menu") app.innerHTML = viewMenu();
  else if (route.view === "checkout") app.innerHTML = viewCheckout();
  else if (route.view === "cocina") app.innerHTML = viewCocina();
  else if (route.view === "admin") app.innerHTML = viewAdmin();
  else if (route.view === "orden") app.innerHTML = viewOrden(route.numero || "");
  else app.innerHTML = viewMenu();
}

function exportarCSV() {
  const base = state.pedidos.filter((p) => inRange(p.creadoEn));
  const r = adminReporte(base);
  const filas = [
    ["Platillo", "Unidades", "Ingreso CRC"],
    ...r.filas.map((f) => [f.nombre, String(f.unidades), String(f.ingreso)]),
    ["TOTAL", "", String(r.total)],
  ];
  const csv = filas.map((f) => f.map((c) => `"${c}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte-ingresos-combo-mortal.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportarRespaldoEstado() {
  const respaldo = {
    version: CONFIG.version || 1,
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "combo-mortal-respaldo.json";
  a.click();
  URL.revokeObjectURL(url);
}

async function importarRespaldoEstado(payload) {
  if (!payload || typeof payload !== "object" || !payload.state || !validateState(payload.state)) {
    throw new Error("Archivo de respaldo invalido.");
  }
  state = payload.state;
  await apiPut("/state", { state });
  render();
}

app.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  if (!target || !state) return;
  const action = target.dataset.action;

  if (action === "menu-filtro") {
    ui.filtro = target.dataset.value;
    render();
  }

  if (action === "menu-cant") {
    const id = target.dataset.id;
    const delta = Number(target.dataset.delta || 0);
    const actual = ui.cantidadesMenu[id] || 1;
    ui.cantidadesMenu[id] = Math.max(1, Math.min(20, actual + delta));
    render();
  }

  if (action === "menu-add") {
    const id = target.dataset.id;
    const cantidad = Math.max(1, Math.min(20, ui.cantidadesMenu[id] || 1));
    agregarCarrito(id, cantidad);
    ui.agregado = id;
    render();
    window.setTimeout(() => {
      ui.agregado = null;
      render();
    }, 1200);
  }

  if (action === "go-checkout") setRoute("checkout");
  if (action === "go-menu") setRoute("menu");
  if (action === "go-cocina") setRoute("cocina");

  if (action === "checkout-cant") {
    const id = target.dataset.id;
    const delta = Number(target.dataset.delta || 0);
    const current = state.carrito.find((x) => x.platilloId === id)?.cantidad || 0;
    setCantidadCarrito(id, current + delta);
    render();
  }

  if (action === "checkout-rm") {
    quitarCarrito(target.dataset.id);
    render();
  }

  if (action === "checkout-confirm") {
    const lineas = cartLineas();
    if (lineas.length === 0) {
      ui.checkoutError = "Necesitas al menos un articulo en el pedido para confirmar el pago.";
      render();
      return;
    }

    if (ui.metodoPago !== "Efectivo" && ui.datosPago.trim().length < 6) {
      ui.checkoutError =
        ui.metodoPago === "Tarjeta"
          ? 'Completa el campo "Numero de tarjeta" para continuar.'
          : 'Completa el campo "Telefono SINPE" para continuar.';
      render();
      return;
    }

    ui.checkoutError = "";
    ui.procesando = true;
    render();

    const pedido = crearPedido(ui.metodoPago);
    window.setTimeout(() => {
      ui.procesando = false;
      ui.datosPago = "";
      setOrderRoute(pedido.numero);
    }, 700);
  }

  if (action === "cocina-select") {
    ui.seleccionCocina = target.dataset.id;
    ui.avisoCocina = "";
    ui.borradorCocina = {};
    render();
  }

  if (action === "cocina-save") {
    const pedidoId = target.dataset.id;
    const index = Number(target.dataset.index);
    const key = target.dataset.key;
    const pedido = state.pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;

    const itemActual = pedido.items[index];
    const opciones = transicionesValidas(itemActual.estado);
    const nuevo = ui.borradorCocina[key] || opciones[0];
    if (!nuevo) return;

    cambiarEstadoItemPedido(pedidoId, index, nuevo, "cocinero.turno1");
    ui.avisoCocina = `${itemActual.nombre}: ${ETIQUETA_ITEM[itemActual.estado]} -> ${ETIQUETA_ITEM[nuevo]}`;
    delete ui.borradorCocina[key];
    render();
  }

  if (action === "admin-filtro") {
    ui.filtroAdmin = target.dataset.value;
    render();
  }

  if (action === "admin-confirm") {
    ui.confirmarEntregaId = target.dataset.id;
    render();
  }

  if (action === "admin-no") {
    ui.confirmarEntregaId = null;
    render();
  }

  if (action === "admin-yes") {
    marcarEntregado(target.dataset.id);
    ui.confirmarEntregaId = null;
    render();
  }

  if (action === "admin-open") {
    setOrderRoute(target.dataset.numero);
  }

  if (action === "admin-export") exportarCSV();
  if (action === "admin-export-state") exportarRespaldoEstado();

  if (action === "admin-import-state-click") {
    const input = document.getElementById("import-state-file");
    if (input) input.click();
  }

  if (action === "foto") {
    openLightbox(target.dataset.src, target.dataset.alt);
  }
});

app.addEventListener("change", async (e) => {
  const target = e.target;
  const action = target.dataset.action;
  if (!action || !state) return;

  if (action === "metodo-pago") {
    ui.metodoPago = target.value;
    ui.datosPago = "";
    ui.checkoutError = "";
    render();
  }

  if (action === "datos-pago") {
    ui.datosPago = target.value;
  }

  if (action === "cocina-draft") {
    ui.borradorCocina[target.dataset.key] = target.value;
  }

  if (action === "admin-desde") {
    ui.desdeAdmin = target.value;
    render();
  }

  if (action === "admin-hasta") {
    ui.hastaAdmin = target.value;
    render();
  }

  if (action === "admin-import-state-file") {
    const file = target.files && target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importarRespaldoEstado(json);
      alert("Respaldo importado correctamente.");
    } catch (error) {
      alert("No se pudo importar respaldo: " + error.message);
    } finally {
      target.value = "";
    }
  }
});

app.addEventListener("input", (e) => {
  const target = e.target;
  if (target.dataset.action === "datos-pago") {
    ui.datosPago = target.value;
  }
});

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = alt;
  lightbox.hidden = false;
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
  lightboxImg.alt = "";
}

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

lightboxClose.addEventListener("click", closeLightbox);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});

window.addEventListener("hashchange", render);
boot();
