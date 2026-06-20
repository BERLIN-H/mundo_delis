/**
 * MUNDO DELIS · Domicilios Page Logic
 * Archivo: js/domicilios.js
 */

// ── ESTADO ──
let CATEGORIAS   = [];
let PRODUCTOS    = {};        // { catId: [producto, ...] }
let OPCIONES_CACHE = {};
let pedido       = [];        // [{ uid, id, name, price, img, qty, opciones }]
let activeCat    = null;
let HORARIO      = null;
let ESTA_ABIERTO = false;
let METODOS_PAGO = [];
let metodoPagoElegido = null;
let optDraft     = null;

// ══════════════════════════════════════════════
//  CARGA INICIAL
// ══════════════════════════════════════════════
async function initCatalogo() {
  try {
    const [cats, prods, horario, metodos] = await Promise.all([
      sbGet('/categorias?select=*&order=orden.asc'),
      sbGet('/productos?select=*&visible=eq.true&order=created_at.asc'),
      cargarHorarioSemana(),
      cargarMetodosPago(),
    ]);

    CATEGORIAS = cats;
    PRODUCTOS  = prods.reduce((acc, p) => {
      (acc[p.categoria_id] = acc[p.categoria_id] || []).push(p);
      return acc;
    }, {});

    activeCat = CATEGORIAS[0]?.id || null;

    HORARIO = horario;
    METODOS_PAGO = metodos || [];
    aplicarEstadoHorario();
    renderHorarioCard();
    renderMetodosPago();
    aplicarPrefill();
  } catch (e) {
    console.error('Error cargando catálogo:', e);
  }
}

// ══════════════════════════════════════════════
//  HORARIO
// ══════════════════════════════════════════════
function aplicarEstadoHorario() {
  const dot      = document.getElementById('status-dot');
  const txt      = document.getElementById('status-txt');
  const banner   = document.getElementById('closed-banner');
  const bannerTxt= document.getElementById('closed-banner-text');
  const btn      = document.getElementById('send-btn');
  const btnTxt   = document.getElementById('send-btn-text');
  const helper   = document.getElementById('send-helper');

  if (!HORARIO) { txt.textContent = 'Horario no disponible'; return; }

  const { abierto, dia } = calcularEstadoHorario(HORARIO);
  ESTA_ABIERTO = abierto;

  dot.className = 'status-dot ' + (abierto ? 'dot-open' : 'dot-closed');
  txt.textContent = abierto ? 'Abierto ahora' : 'Cerrado en este momento';

  if (abierto) {
    banner.style.display = 'none';
    btn.disabled = false;
    btnTxt.textContent = 'Enviar pedido por WhatsApp';
    helper.textContent = 'Al enviar se abrirá WhatsApp con el resumen de tu pedido listo para enviar.';
  } else {
    banner.style.display = 'flex';
    btn.disabled = true;
    btnTxt.textContent = 'Cerrado en este momento';
    bannerTxt.textContent = dia?.abierto
      ? `Estamos cerrados por ahora. Hoy atendemos de ${horaLegible(dia.apertura)} a ${horaLegible(dia.cierre)}.`
      : 'No atendemos domicilios hoy. Revisa nuestro horario abajo.';
    helper.textContent = 'No podrás enviar tu pedido hasta que estemos abiertos.';
  }
}

function renderHorarioCard() {
  const cont = document.getElementById('dom-schedule-rows');
  if (!HORARIO) { cont.innerHTML = ''; return; }

  const orden = [1,2,3,4,5,6,0];
  const dias  = orden.map(i => ({ idx: i, ...HORARIO[String(i)] }));

  const grupos = [];
  let actual = null;
  dias.forEach(d => {
    const key = d.abierto ? `${d.apertura}-${d.cierre}` : 'cerrado';
    if (actual && actual.key === key) actual.dias.push(d.idx);
    else { actual = { key, dias: [d.idx], abierto: d.abierto, apertura: d.apertura, cierre: d.cierre }; grupos.push(actual); }
  });

  cont.innerHTML = grupos.map(g => {
    const nombres  = g.dias.map(i => NOMBRES_DIA[i]);
    const etiqueta = nombres.length > 1 ? `${nombres[0]} – ${nombres[nombres.length-1]}` : nombres[0];
    const horTxt   = g.abierto ? `${horaLegible(g.apertura)} – ${horaLegible(g.cierre)}` : 'Cerrado';
    return `<div class="info-row"><i class="ti ti-calendar"></i><span>${etiqueta}: ${horTxt}</span></div>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  MÉTODOS DE PAGO
// ══════════════════════════════════════════════
function renderMetodosPago() {
  const cont = document.getElementById('pago-options');
  if (!METODOS_PAGO.length) {
    cont.innerHTML = `<span style="font-size:13px;color:var(--text-soft);">No hay métodos configurados</span>`;
    return;
  }
  cont.innerHTML = METODOS_PAGO.map(m => `
    <button type="button" class="opt-chip" id="pago-chip-${cssEscape(m)}"
            onclick="elegirMetodoPago('${m.replace(/'/g,"\\'")}')">
      ${m}
    </button>`).join('');
}

function elegirMetodoPago(metodo) {
  metodoPagoElegido = metodo;
  METODOS_PAGO.forEach(m => {
    const el = document.getElementById(`pago-chip-${cssEscape(m)}`);
    if (el) el.classList.toggle('selected', m === metodo);
  });
  document.getElementById('hint-pago').classList.remove('show');
}

function cssEscape(s) {
  return s.replace(/[^a-zA-Z0-9]/g, '_');
}

// ══════════════════════════════════════════════
//  PREFILL DESDE DETALLE
// ══════════════════════════════════════════════
function aplicarPrefill() {
  const raw = sessionStorage.getItem('md_prefill');
  if (!raw) return;
  sessionStorage.removeItem('md_prefill');
  try {
    const data = JSON.parse(raw);
    pedido.push({ uid: `${data.id}-${Date.now()}`, id: data.id, name: data.nombre, price: data.precio, img: data.img, qty: 1, opciones: data.opciones || [] });
    renderPedido();
  } catch(e) { console.error(e); }
}

// ══════════════════════════════════════════════
//  PICKER — MODAL
// ══════════════════════════════════════════════
function openPicker() {
  if (!CATEGORIAS.length) {
    initCatalogo().then(() => { renderPickerTabs(); renderPickerGrid(activeCat); });
  } else {
    renderPickerTabs();
    renderPickerGrid(activeCat);
  }
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePicker() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closePickerOuter(e) {
  if (e.target === document.getElementById('overlay')) closePicker();
}

// ── Tabs ──
function renderPickerTabs() {
  const tabs = document.getElementById('picker-tabs');
  if (!CATEGORIAS.length) {
    tabs.innerHTML = `<div style="padding:12px 16px;font-size:13px;color:var(--text-soft)">Cargando…</div>`;
    return;
  }
  tabs.innerHTML = CATEGORIAS.map(c => `
    <button class="picker-tab ${c.id === activeCat ? 'active' : ''}" onclick="switchCat('${c.id}')">
      <i class="ti ${c.icono}"></i>${c.nombre}
    </button>`).join('');
}

function switchCat(catId) {
  activeCat = catId;
  renderPickerTabs();
  renderPickerGrid(catId);
}

// ── Grid ──
function renderPickerGrid(catId) {
  const grid  = document.getElementById('picker-grid');
  const group = CATEGORIAS.find(c => c.id === catId);
  const prods = PRODUCTOS[catId] || [];

  if (!group) { grid.innerHTML = ''; return; }

  if (!prods.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 16px;color:var(--text-soft);">
        <i class="ti ti-clock" style="font-size:40px;display:block;margin-bottom:12px;color:var(--pink-mid);"></i>
        <strong style="font-family:'Playfair Display',serif;color:var(--text-mid);">Próximamente</strong>
        <p style="font-size:13px;margin-top:6px;">Estamos preparando esta sección 🩷</p>
      </div>`;
    return;
  }

  grid.innerHTML = prods.map(p => {
    const qty = pedido.filter(x => x.id === p.id).reduce((a, x) => a + x.qty, 0);
    const hasImg = !!(p.imagen_url && p.imagen_url.trim());

    return `
    <div class="pcard" id="pcard-${p.id}">
      <div class="pcard-img-wrap">
        ${hasImg
          ? `<img class="pcard-img" src="${p.imagen_url}" alt="${p.nombre}"
                  onerror="this.remove();document.getElementById('picon-${p.id}').style.display='flex';">`
          : ''}
        <div class="pcard-icon" id="picon-${p.id}" style="display:${hasImg ? 'none' : 'flex'}">
          <i class="ti ${group.icono}"></i>
        </div>
        ${qty > 0 ? `<span class="pcard-badge">${qty}</span>` : ''}
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${p.nombre}</div>
        <div class="pcard-price">${fmt(p.precio)}</div>
      </div>
      <button class="pcard-btn" onclick="onAddClick('${p.id}')">
        <i class="ti ti-plus"></i> Agregar
      </button>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════
//  AGREGAR PRODUCTO
// ══════════════════════════════════════════════
async function onAddClick(prodId) {
  const prod = (PRODUCTOS[activeCat] || []).find(p => p.id === prodId);
  if (!prod) return;

  const opciones = await cargarOpciones(prodId);
  if (!opciones.length) {
    agregarAlPedido(prod, []);
    renderPickerGrid(activeCat);
    return;
  }
  abrirModalOpciones(prod, opciones);
}

async function cargarOpciones(prodId) {
  if (OPCIONES_CACHE[prodId]) return OPCIONES_CACHE[prodId];
  try {
    const rows = await sbGet(`/producto_opciones?producto_id=eq.${prodId}&order=orden.asc&select=*,producto_opciones_valores(*)`);
    const opciones = (rows || []).map(op => ({
      id: op.id,
      titulo: op.titulo,
      obligatorio: op.obligatorio,
      valores: (op.producto_opciones_valores || []).slice().sort((a,b) => a.orden - b.orden),
    }));
    OPCIONES_CACHE[prodId] = opciones;
    return opciones;
  } catch(e) {
    console.error('Error cargando opciones:', e);
    return [];
  }
}

function agregarAlPedido(prod, opcionesElegidas) {
  let extra = 0;
  opcionesElegidas.forEach(o => { extra += o.precio_extra || 0; });
  pedido.push({
    uid:     `${prod.id}-${Date.now()}`,
    id:      prod.id,
    name:    prod.nombre,
    price:   prod.precio + extra,
    img:     prod.imagen_url,
    qty:     1,
    opciones: opcionesElegidas.map(o => `${o.tituloGrupo}: ${o.etiqueta}`),
  });
  renderPedido();
}

// ── Modal opciones ──
function abrirModalOpciones(prod, opciones) {
  optDraft = { prod, opciones, seleccion: {} };
  document.getElementById('opt-modal-title').textContent = prod.nombre;
  renderOptModalBody();
  document.getElementById('opt-overlay').classList.add('open');
}

function renderOptModalBody() {
  document.getElementById('opt-modal-body').innerHTML = optDraft.opciones.map(op => `
    <div class="opt-group" id="modal-optgroup-${op.id}">
      <span class="opt-group-title">${op.titulo}</span>
      ${op.obligatorio ? '<span class="opt-group-required">Elige una opción</span>' : ''}
      <div class="opt-chip-row">
        ${op.valores.map(v => `
          <button type="button" class="opt-chip" id="modal-chip-${v.id}"
            onclick="elegirOpcionModal('${op.id}','${v.id}')">
            ${v.etiqueta}${v.precio_extra > 0 ? `<span class="extra">+${fmt(v.precio_extra)}</span>` : ''}
          </button>`).join('')}
      </div>
      <span class="opt-missing-hint" id="modal-hint-${op.id}">Por favor elige una opción</span>
    </div>`).join('');
}

function elegirOpcionModal(opcionId, valorId) {
  optDraft.seleccion[opcionId] = valorId;
  const op = optDraft.opciones.find(o => o.id === opcionId);
  op.valores.forEach(v => {
    document.getElementById(`modal-chip-${v.id}`).classList.toggle('selected', v.id === valorId);
  });
  document.getElementById(`modal-hint-${opcionId}`).classList.remove('show');
}

function confirmarOpciones() {
  if (!optDraft) return;
  const faltantes = optDraft.opciones.filter(op => op.obligatorio && !optDraft.seleccion[op.id]);
  if (faltantes.length) {
    faltantes.forEach(op => document.getElementById(`modal-hint-${op.id}`).classList.add('show'));
    return;
  }
  const elegidas = optDraft.opciones
    .filter(op => optDraft.seleccion[op.id])
    .map(op => {
      const val = op.valores.find(v => v.id === optDraft.seleccion[op.id]);
      return { tituloGrupo: op.titulo, etiqueta: val.etiqueta, precio_extra: val.precio_extra };
    });
  agregarAlPedido(optDraft.prod, elegidas);
  closeOptModal();
  renderPickerGrid(activeCat);
}

function closeOptModal() {
  document.getElementById('opt-overlay').classList.remove('open');
  optDraft = null;
}

function closeOptModalOuter(e) {
  if (e.target === document.getElementById('opt-overlay')) closeOptModal();
}

// ══════════════════════════════════════════════
//  PEDIDO — render
// ══════════════════════════════════════════════
function renderPedido() {
  const sel      = document.getElementById('prod-selector');
  const totalRow = document.getElementById('total-row');

  if (!pedido.length) {
    sel.innerHTML = `<div style="font-size:13px;color:var(--text-soft);text-align:center;padding:12px 0;">Aún no has agregado productos</div>`;
    totalRow.style.display = 'none';
    return;
  }

  sel.innerHTML = pedido.map((item, i) => `
    <div class="prod-sel-item">
      ${item.img
        ? `<img src="${item.img}" alt="${item.name}" class="sel-thumb" onerror="this.remove()">`
        : ''}
      <div style="flex:1;min-width:0;">
        <span style="font-size:13px;display:block;">${item.name}</span>
        ${item.opciones?.length ? `<span style="font-size:11px;color:var(--text-soft);">${item.opciones.join(' · ')}</span>` : ''}
      </div>
      <div class="sel-qty-row">
        <button class="sel-qty-btn" onclick="changeQty(${i},-1)">−</button>
        <span class="sel-qty-val">${item.qty}</span>
        <button class="sel-qty-btn" onclick="changeQty(${i},1)">+</button>
      </div>
      <span style="font-size:13px;color:var(--gold);min-width:64px;text-align:right;">${fmt(item.price * item.qty)}</span>
      <button class="sel-remove" onclick="removeItem(${i})" aria-label="Eliminar"><i class="ti ti-trash"></i></button>
    </div>`).join('');

  const total = pedido.reduce((a, x) => a + x.price * x.qty, 0);
  document.getElementById('total-val').textContent = fmt(total);
  totalRow.style.display = 'flex';
}

function changeQty(i, d) {
  pedido[i].qty = Math.max(1, pedido[i].qty + d);
  renderPedido();
}

function removeItem(i) {
  pedido.splice(i, 1);
  renderPedido();
  renderPickerGrid(activeCat);
}

function pickerListo() { closePicker(); }

// ══════════════════════════════════════════════
//  ENVIAR POR WHATSAPP
// ══════════════════════════════════════════════
function enviar() {
  if (!ESTA_ABIERTO) {
    aplicarEstadoHorario();
    showNotice('En este momento estamos cerrados. Revisa nuestro horario de atención más abajo.', { title: 'Estamos cerrados' });
    return;
  }

  const nombre = document.getElementById('inp-nombre').value.trim();
  const tel    = document.getElementById('inp-tel').value.trim();
  const dir    = document.getElementById('inp-dir').value.trim();
  const nota   = document.getElementById('inp-nota').value.trim();

  if (!nombre)                      { showNotice('Por favor ingresa tu nombre completo.'); return; }
  if (!nombre.includes(' '))        { showNotice('Por favor ingresa tu nombre y apellido.'); return; }
  if (!tel)                         { showNotice('Por favor ingresa tu número de teléfono.'); return; }
  if (!dir)                         { showNotice('Por favor ingresa la dirección de entrega.'); return; }
  if (!pedido.length)               { showNotice('Agrega al menos un producto a tu pedido.'); return; }
  if (!metodoPagoElegido) {
    document.getElementById('hint-pago').classList.add('show');
    document.getElementById('pago-options').scrollIntoView({ behavior:'smooth', block:'center' });
    showNotice('Por favor elige un método de pago.');
    return;
  }

  const total = pedido.reduce((a, x) => a + x.price * x.qty, 0);
  const lines = pedido.map(x => {
    const ops = x.opciones?.length ? ` (${x.opciones.join(', ')})` : '';
    return `  • ${x.name}${ops} x${x.qty} — ${fmt(x.price * x.qty)}`;
  }).join('\n');

  let msg =
    `🍰 *Nuevo pedido — Mundo Delis*\n\n` +
    `👤 *Nombre:* ${nombre}\n` +
    `📞 *Teléfono:* ${tel}\n` +
    `📍 *Dirección:* ${dir}\n` +
    `💳 *Método de pago:* ${metodoPagoElegido}\n\n` +
    `🛍️ *Pedido:*\n${lines}\n\n` +
    `💰 *Total estimado:* ${fmt(total)}`;

  if (nota) msg += `\n\n📝 *Nota:* ${nota}`;

  window.location.href = `https://wa.me/573242601994?text=${encodeURIComponent(msg)}`;
}

// ══════════════════════════════════════════════
//  NOTICE MODAL
// ══════════════════════════════════════════════
function showNotice(text, opts = {}) {
  const { title = 'Atención', success = false } = opts;
  document.getElementById('notice-title').textContent = title;
  document.getElementById('notice-text').textContent  = text;
  const icon = document.getElementById('notice-icon');
  icon.classList.toggle('success', success);
  icon.innerHTML = `<i class="ti ${success ? 'ti-circle-check' : 'ti-alert-circle'}"></i>`;
  document.getElementById('notice-overlay').classList.add('open');
}

function closeNotice() { document.getElementById('notice-overlay').classList.remove('open'); }
function closeNoticeOuter(e) { if (e.target === document.getElementById('notice-overlay')) closeNotice(); }

// ── Inicio ──
initCatalogo();