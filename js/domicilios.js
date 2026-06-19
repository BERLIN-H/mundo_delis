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
];

// ── ESTADO ──
let pedido      = [];   // [{ id, name, price, img, qty }]
let activeCat   = CATALOG[0].id;

// ══════════════════════════════════════════════
//  PICKER — abrir / cerrar
// ══════════════════════════════════════════════
function openPicker() {
  renderPickerTabs();
  renderPickerGrid(activeCat);
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
  tabs.innerHTML = CATALOG.map(g => `
    <button
      class="picker-tab ${g.id === activeCat ? 'active' : ''}"
      onclick="switchCat('${g.id}')">
      <i class="ti ${g.icono}"></i>
      ${g.cat}
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
  const group = CATALOG.find(g => g.id === catId);
  if (!group) return;

  const grid = document.getElementById('picker-grid');
  grid.innerHTML = group.prods.map(p => {
    const inCart = pedido.find(x => x.id === p.id);
    const qty    = inCart ? inCart.qty : 0;
    return `
    <div class="picker-card" id="pcard-${p.id}">
      <div class="picker-card-img">
        <img src="${p.img}" alt="${p.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="picker-card-icon" style="display:none">
          <i class="ti ${group.icono}"></i>
        </div>
        ${qty > 0 ? `<span class="picker-badge">${qty}</span>` : ''}
      </div>
      <div class="picker-card-body">
        <div class="picker-card-name">${p.name}</div>
        <div class="picker-card-price">${fmt(p.price)}</div>
      </div>
      <div class="picker-card-actions">
        ${qty === 0
          ? `<button class="picker-add-btn" onclick="addProduct('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},'${p.img}')">
               <i class="ti ti-plus"></i> Agregar
             </button>`
          : `<div class="picker-qty-row">
               <button class="sel-qty-btn" onclick="pickerChangeQty('${p.id}',-1)">−</button>
               <span class="sel-qty-val">${qty}</span>
               <button class="sel-qty-btn" onclick="pickerChangeQty('${p.id}',1)">+</button>
             </div>`
        }
      </div>
    </div>`;
  }).join('');
}

// ── Cambiar cantidad desde el picker ──
function pickerChangeQty(id, d) {
  const ex = pedido.find(x => x.id === id);
  if (!ex) return;
  ex.qty = Math.max(0, ex.qty + d);
  if (ex.qty === 0) pedido = pedido.filter(x => x.id !== id);
  renderPickerGrid(activeCat);
  renderPickerTabs(); // actualiza badges en tabs si los hay
  renderPedido();
}

// ── Agregar producto desde el picker ──
function addProduct(id, name, price, img) {
  const ex = pedido.find(x => x.id === id);
  if (ex) { ex.qty++; }
  else     { pedido.push({ id, name, price, img, qty: 1 }); }
  renderPickerGrid(activeCat);
  renderPedido();
  // NO cierra el picker → el usuario puede seguir agregando
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
      <span style="flex:1;font-size:13px;">${item.name}</span>
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
  const lines = pedido.map(x =>
    `  • ${x.name} x${x.qty} — ${fmt(x.price * x.qty)}`
  ).join('%0A');

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

// ── Formatear precio ──
function fmt(n) {
  return '$' + parseInt(n).toLocaleString('es-CO');
}
