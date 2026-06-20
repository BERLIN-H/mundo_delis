/**
 * MUNDO DELIS · Domicilios Page Logic
 * Archivo: js/domicilios.js
 */

// ── CATÁLOGO LOCAL ──
const CATALOG = [
  { id: 'galleteria', cat: 'Galletería', icono: 'ti-cookie', prods: [
    { id:'g1', name:'Merengues',               price:12000, img:'../img/galleteria/merengues.avif' },
    { id:'g2', name:'Brownies',                price:8000,  img:'../img/galleteria/Brownies.avif' },
    { id:'g3', name:'Pavlovas',                price:10000, img:'../img/galleteria/Pavlovas.avif' },
    { id:'g4', name:'Alfajores',               price:3500,  img:'../img/galleteria/Alfajores.avif' },
    { id:'g5', name:'Galletas de mantequilla', price:10000, img:'../img/galleteria/galletas-mantequilla.avif' },
    { id:'g6', name:'New York cookies',        price:5000,  img:'../img/galleteria/new-york-cookies.avif' },
  ]},
  { id: 'postres', cat: 'Postres', icono: 'ti-cake', prods: [
    { id:'p1',  name:'Tarta de Queso',            price:22000, img:'../img/postres/tarta-queso.avif' },
    { id:'p2',  name:'Crema con durazno',          price:20000, img:'../img/postres/crema-durazno.avif' },
    { id:'p3',  name:'Tres Leches Tradicional',    price:20000, img:'../img/postres/tres-leches.avif' },
    { id:'p4',  name:'Arroz con Leche',            price:15000, img:'../img/postres/arroz-leche.avif' },
    { id:'p5',  name:'Arequipe Fusión',            price:15000, img:'../img/postres/arequipe-fusion.avif' },
    { id:'p6',  name:'Porción torta de zanahoria', price:17000, img:'../img/postres/torta-zanahoria.avif' },
    { id:'p7',  name:'Brownie con helado',         price:20000, img:'../img/postres/brownie-helado.avif' },
    { id:'p8',  name:'Genovesa',                   price:20000, img:'../img/postres/genovesa.avif' },
    { id:'p9',  name:'Napoleón',                   price:17000, img:'../img/postres/napoleon.avif' },
    { id:'p10', name:'Cuatro Leches',              price:18000, img:'../img/postres/cuatro-leches.avif' },
    { id:'p11', name:'Pie de Limón',               price:18000, img:'../img/postres/pie-limon.avif' },
    { id:'p12', name:'Flan de Caramelo',           price:18000, img:'../img/postres/flan-caramelo.avif' },
    { id:'p13', name:'Porción de Torta Fría',      price:17000, img:'../img/postres/torta-fria.avif' },
    { id:'p14', name:'Torta amapola y yogurt',     price:15000, img:'../img/postres/torta-amapola.avif' },
    { id:'p15', name:'Fresas con crema',           price:22000, img:'../img/postres/fresas-crema.avif' },
    { id:'p16', name:'Raspao MD',                  price:18000, img:'../img/postres/raspao.avif' },
    { id:'p17', name:'Cremoso de Brownie',         price:15000, img:'../img/postres/cremoso-brownie.avif' },
  ]},
  { id: 'panaderia', cat: 'Panadería', icono: 'ti-bread', prods: [
    { id:'pan1', name:'Salad Croissant',              price:25000, img:'../img/panaderia/salad-croissant.avif',  desc:'Croissant + jamón, queso, verduras y salsa' },
    { id:'pan2', name:'Crookie',                      price:20000, img:'../img/panaderia/crookie.avif' },
    { id:'pan3', name:'Paliquesos',                   price:8000,  img:'../img/panaderia/paliquesos.avif' },
    { id:'pan4', name:'Rollos de jamón',              price:8000,  img:'../img/panaderia/rollos-jamon.avif' },
    { id:'pan5', name:'Croissant de almendras',       price:20000, img:'../img/panaderia/croissant-almendras.avif' },
    { id:'pan6', name:'Croissant de pollo en salsa blanca', price:27000, img:'../img/panaderia/croissant-pollo.avif' },
  ]},
  { id: 'waffles', cat: 'Waffles', icono: 'ti-waffle', prods: [
    { id:'w1', name:'Waffle Frutos Rojos',           price:25000, img:'../img/waffles/frutos-rojos.avif' },
    { id:'w2', name:'Waffle Arequipe Clásico',       price:25000, img:'../img/waffles/arequipe-clasico.avif' },
    { id:'w3', name:'Waffle Nutella',                price:25000, img:'../img/waffles/nutella.avif' },
  ]},
  { id: 'bebidas', cat: 'Bebidas', icono: 'ti-bottle', prods: [
    { id:'b1', name:'Soda Hatsu',           price:17000, img:'../img/bebidas/soda-hatsu.avif' },
    { id:'b2', name:'JP Chenet Rosé 250ml', price:25000, img:'../img/bebidas/jp-chenet-rose.avif' },
    { id:'b3', name:'Coca Cola 250ml',      price:5000,  img:'../img/bebidas/coca-cola.avif' },
    { id:'b4', name:'Coca Cola Zero 250ml', price:5000,  img:'../img/bebidas/coca-cola-zero.avif' },
    { id:'b5', name:'Agua 310ml',           price:4000,  img:'../img/bebidas/agua.avif' },
    { id:'b6', name:'Soda Bretaña 300ml',   price:8000,  img:'../img/bebidas/soda-bretana.avif' },
    { id:'b7', name:'Sodas Frutales MD',    price:15000, img:'../img/bebidas/sodas-frutales.avif', desc:'Sabores: Fresa-limón, Maracupiña, Frutos Amarillos' },
    { id:'b8', name:'Jugo de Fresa',        price:12000, img:'../img/bebidas/jugo-fresa.avif' },
    { id:'b9', name:'Malteada de Vainilla', price:16000, img:'../img/bebidas/malteada-vainilla.avif' },
    { id:'b10',name:'Malteada ChocoBrownie',price:16000, img:'../img/bebidas/malteada-chocobrownie.avif' },
  ]},
  { id: 'vinos-cafe', cat: 'Vinos y Café', icono: 'ti-glass-full', prods: [
    { id:'vc1', name:'Capuccino',          price:8000,  img:'../img/vinos-cafe/capuccino.avif' },
    { id:'vc2', name:'Café',               price:5000,  img:'../img/vinos-cafe/cafe.avif' },
    { id:'vc3', name:'Tinto de verano',    price:30000, img:'../img/vinos-cafe/tinto-verano.avif' },
    { id:'vc4', name:'Sangría MD',         price:35000, img:'../img/vinos-cafe/sangria-md.avif' },
    { id:'vc5', name:'Margarita Fresa',    price:30000, img:'../img/vinos-cafe/margarita-fresa.avif' },
    { id:'vc6', name:'Aperol Spritz',      price:33000, img:'../img/vinos-cafe/aperol-spritz.avif' },
    { id:'vc7', name:'Pop Champagne Rose', price:35000, img:'../img/vinos-cafe/pop-champagne.avif' },
    { id:'vc8', name:'Mojito',             price:28000, img:'../img/vinos-cafe/mojito.avif' },
  ]},
  { id: 'saludable', cat: 'Línea Saludable', icono: 'ti-salad', prods: [
    { id:'s1', name:'Bowl Frutal MD',  price:20000, img:'../img/saludable/bowl-frutal.avif', desc:'Frutas frescas de temporada con granola y yogurt' },
    { id:'s2', name:'Waffle de yuca',  price:25000, img:'../img/saludable/waffle-yuca.avif', desc:'Base de yuca, opción sin gluten' },
    { id:'s3', name:'Sándwich de yuca pollo en salsa blanca', price:27000, img:'../img/saludable/sandwich-yuca.avif', desc:'Base de yuca con pollo en salsa blanca' },
  ]},
];

// ── ESTADO ──
let CATEGORIAS = [];   // [{id, nombre, icono, orden}]
let PRODUCTOS  = {};   // { catId: [producto, ...] }
let OPCIONES_CACHE = {}; // { productoId: [{id, titulo, obligatorio, valores}] }
let pedido     = [];   // [{ uid, id, name, price, img, qty, opciones: ["titulo: valor", ...] }]
let activeCat  = null;
 
// Estado temporal del modal de opciones (mientras el usuario elige sabor/tipo)
let optDraft = null; // { prod, opciones, seleccion: {opcionId: valorId} }
 
// ══════════════════════════════════════════════
//  CARGA INICIAL DESDE SUPABASE
// ══════════════════════════════════════════════
async function initCatalogo() {
  try {
    const [cats, prods] = await Promise.all([
      sbGet('/categorias?select=*&order=orden.asc'),
      sbGet('/productos?select=*&visible=eq.true&order=created_at.asc'),
    ]);
 
    CATEGORIAS = cats;
    PRODUCTOS  = prods.reduce((acc, p) => {
      (acc[p.categoria_id] = acc[p.categoria_id] || []).push(p);
      return acc;
    }, {});
 
    activeCat = CATEGORIAS[0]?.id || null;
    aplicarPrefill();
  } catch (e) {
    console.error('Error cargando catálogo:', e);
  }
}
 
// ── Si venimos de detalle.html con un producto + opciones ya elegidas, lo agregamos directo ──
function aplicarPrefill() {
  const raw = sessionStorage.getItem('md_prefill');
  if (!raw) return;
  sessionStorage.removeItem('md_prefill');
 
  try {
    const data = JSON.parse(raw);
    pedido.push({
      uid: `${data.id}-${Date.now()}`,
      id: data.id,
      name: data.nombre,
      price: data.precio,
      img: data.img,
      qty: 1,
      opciones: data.opciones || [],
    });
    renderPedido();
  } catch (e) { console.error(e); }
}
 
// ══════════════════════════════════════════════
//  PICKER — abrir / cerrar
// ══════════════════════════════════════════════
function openPicker() {
  if (!CATEGORIAS.length) {
    // Catálogo aún no cargó (red lenta) — reintenta al abrir
    initCatalogo().then(() => {
      renderPickerTabs();
      renderPickerGrid(activeCat);
    });
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
 
// ── Tabs de categoría ──
function renderPickerTabs() {
  const tabs = document.getElementById('picker-tabs');
  if (!CATEGORIAS.length) {
    tabs.innerHTML = `<div style="padding:12px 16px;font-size:13px;color:var(--text-soft)">Cargando categorías…</div>`;
    return;
  }
  tabs.innerHTML = CATEGORIAS.map(c => `
    <button
      class="picker-tab ${c.id === activeCat ? 'active' : ''}"
      onclick="switchCat('${c.id}')">
      <i class="ti ${c.icono}"></i>
      ${c.nombre}
    </button>`
  ).join('');
}
 
function switchCat(catId) {
  activeCat = catId;
  renderPickerTabs();
  renderPickerGrid(catId);
}
 
// ── Grid de cards por categoría ──
function renderPickerGrid(catId) {
  const grid  = document.getElementById('picker-grid');
  const group = CATEGORIAS.find(c => c.id === catId);
  const prods = PRODUCTOS[catId] || [];
 
  if (!group) { grid.innerHTML = ''; return; }
 
  if (!prods.length) {
    grid.innerHTML = `
      <div class="empty-state" style="padding:32px 16px;">
        <i class="ti ti-clock" aria-hidden="true"></i>
        <h3>Próximamente</h3>
        <p>Estamos preparando esta sección<br>con mucho amor 🩷</p>
      </div>`;
    return;
  }
 
  grid.innerHTML = prods.map(p => {
    const enPedido = pedido.filter(x => x.id === p.id);
    const qty = enPedido.reduce((a, x) => a + x.qty, 0);
    return `
    <div class="picker-card" id="pcard-${p.id}">
      <div class="picker-card-img">
        <img src="${p.imagen_url}" alt="${p.nombre}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="picker-card-icon" style="display:none">
          <i class="ti ${group.icono}"></i>
        </div>
        ${qty > 0 ? `<span class="picker-badge">${qty}</span>` : ''}
      </div>
      <div class="picker-card-body">
        <div class="picker-card-name">${p.nombre}</div>
        <div class="picker-card-price">${fmt(p.precio)}</div>
      </div>
      <div class="picker-card-actions">
        <button class="picker-add-btn" onclick="onAddClick('${p.id}')">
          <i class="ti ti-plus"></i> Agregar
        </button>
      </div>
    </div>`;
  }).join('');
}
 
// ══════════════════════════════════════════════
//  AGREGAR PRODUCTO (con o sin opciones)
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
      valores: (op.producto_opciones_valores || []).slice().sort((a, b) => a.orden - b.orden),
    }));
    OPCIONES_CACHE[prodId] = opciones;
    return opciones;
  } catch (e) {
    console.error('Error cargando opciones:', e);
    return [];
  }
}
 
function agregarAlPedido(prod, opcionesElegidas) {
  let extra = 0;
  opcionesElegidas.forEach(o => { extra += o.precio_extra || 0; });
 
  pedido.push({
    uid: `${prod.id}-${Date.now()}`,
    id: prod.id,
    name: prod.nombre,
    price: prod.precio + extra,
    img: prod.imagen_url,
    qty: 1,
    opciones: opcionesElegidas.map(o => `${o.tituloGrupo}: ${o.etiqueta}`),
  });
  renderPedido();
}
 
// ── Modal de opciones ──
function abrirModalOpciones(prod, opciones) {
  optDraft = { prod, opciones, seleccion: {} };
  document.getElementById('opt-modal-title').textContent = prod.nombre;
  renderOptModalBody();
  document.getElementById('opt-overlay').classList.add('open');
}
 
function renderOptModalBody() {
  const body = document.getElementById('opt-modal-body');
  body.innerHTML = optDraft.opciones.map(op => `
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
//  PEDIDO — render y acciones
// ══════════════════════════════════════════════
function renderPedido() {
  const sel      = document.getElementById('prod-selector');
  const totalRow = document.getElementById('total-row');
 
  if (!pedido.length) {
    sel.innerHTML = `
      <div style="font-size:13px;color:var(--text-soft);text-align:center;padding:12px 0;">
        Aún no has agregado productos
      </div>`;
    totalRow.style.display = 'none';
    return;
  }
 
  sel.innerHTML = pedido.map((item, i) => `
    <div class="prod-sel-item">
      <img src="${item.img}" alt="${item.name}" class="sel-thumb"
           onerror="this.style.display='none'">
      <div style="flex:1;min-width:0;">
        <span style="font-size:13px;display:block;">${item.name}</span>
        ${item.opciones && item.opciones.length
          ? `<span style="font-size:11px;color:var(--text-soft);display:block;">${item.opciones.join(' · ')}</span>`
          : ''}
      </div>
      <div class="sel-qty-row">
        <button class="sel-qty-btn" onclick="changeQty(${i},-1)">−</button>
        <span class="sel-qty-val">${item.qty}</span>
        <button class="sel-qty-btn" onclick="changeQty(${i},1)">+</button>
      </div>
      <span style="font-size:13px;color:var(--gold);min-width:64px;text-align:right;">
        ${fmt(item.price * item.qty)}
      </span>
      <button class="sel-remove" onclick="removeItem(${i})" aria-label="Eliminar">
        <i class="ti ti-trash"></i>
      </button>
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
 
// ── Botón "Listo" del picker ──
function pickerListo() {
  closePicker();
}
 
// ══════════════════════════════════════════════
//  ENVIAR POR WHATSAPP
// ══════════════════════════════════════════════
function enviar() {
  const nombre = document.getElementById('inp-nombre').value.trim();
  const tel    = document.getElementById('inp-tel').value.trim();
  const dir    = document.getElementById('inp-dir').value.trim();
  const nota   = document.getElementById('inp-nota').value.trim();
 
  if (!nombre)       { alert('Por favor ingresa tu nombre.');            return; }
  if (!tel)          { alert('Por favor ingresa tu teléfono.');          return; }
  if (!dir)          { alert('Por favor ingresa la dirección de entrega.'); return; }
  if (!pedido.length){ alert('Agrega al menos un producto a tu pedido.'); return; }
 
  const total = pedido.reduce((a, x) => a + x.price * x.qty, 0);
  const lines = pedido.map(x => {
    const opcionesTxt = x.opciones && x.opciones.length ? ` (${x.opciones.join(', ')})` : '';
    return `  • ${x.name}${opcionesTxt} x${x.qty} — ${fmt(x.price * x.qty)}`;
  }).join('%0A');
 
  let msg =
    `🍰 *Nuevo pedido — Mundo Delis*%0A%0A` +
    `👤 *Nombre:* ${nombre}%0A` +
    `📞 *Teléfono:* ${tel}%0A` +
    `📍 *Dirección:* ${dir}%0A%0A` +
    `🛍️ *Pedido:*%0A${lines}%0A%0A` +
    `💰 *Total estimado:* ${fmt(total)}`;
 
  if (nota) msg += `%0A%0A📝 *Nota:* ${nota}`;
 
  const WA_NUMBER = '573242601994';
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
}
 
// ── Inicialización ──
initCatalogo();