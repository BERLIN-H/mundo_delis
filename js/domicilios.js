/**
 * MUNDO DELIS · Domicilios Page Logic
 * Archivo: js/domicilios.js
 */

// ── CATÁLOGO LOCAL ──
const CATALOG = [
  { cat:'Galletería', prods:[
    { id:'g1', name:'Merengues',               price:12000, img:'img/galleteria/merengues.avif' },
    { id:'g2', name:'Brownies',                price:8000,  img:'img/galleteria/brownies.avif' },
    { id:'g3', name:'Pavlovas',                price:10000, img:'img/galleteria/pavlovas.avif' },
    { id:'g4', name:'Alfajores',               price:3500,  img:'img/galleteria/alfajores.avif' },
    { id:'g5', name:'Galletas de mantequilla', price:10000, img:'img/galleteria/galletas-mantequilla.avif' },
    { id:'g6', name:'New York cookies',        price:5000,  img:'img/galleteria/new-york-cookies.avif' },
  ]},
  { cat:'Postres', prods:[
    { id:'p1',  name:'Tarta de Queso',            price:22000, img:'img/postres/tarta-queso.avif' },
    { id:'p2',  name:'Crema con durazno',          price:20000, img:'img/postres/crema-durazno.avif' },
    { id:'p3',  name:'Tres Leches Tradicional',    price:20000, img:'img/postres/tres-leches.avif' },
    { id:'p4',  name:'Arroz con Leche',            price:15000, img:'img/postres/arroz-leche.avif' },
    { id:'p5',  name:'Arequipe Fusión',            price:15000, img:'img/postres/arequipe-fusion.avif' },
    { id:'p6',  name:'Porción torta de zanahoria', price:17000, img:'img/postres/torta-zanahoria.avif' },
    { id:'p7',  name:'Brownie con helado',         price:20000, img:'img/postres/brownie-helado.avif' },
    { id:'p8',  name:'Genovesa',                   price:20000, img:'img/postres/genovesa.avif' },
    { id:'p9',  name:'Napoleón',                   price:17000, img:'img/postres/napoleon.avif' },
    { id:'p10', name:'Cuatro Leches',              price:18000, img:'img/postres/cuatro-leches.avif' },
    { id:'p11', name:'Pie de Limón',               price:18000, img:'img/postres/pie-limon.avif' },
    { id:'p12', name:'Flan de Caramelo',           price:18000, img:'img/postres/flan-caramelo.avif' },
    { id:'p13', name:'Porción de Torta Fría',      price:17000, img:'img/postres/torta-fria.avif' },
    { id:'p14', name:'Torta amapola y yogurt',     price:15000, img:'img/postres/torta-amapola.avif' },
    { id:'p15', name:'Fresas con crema',           price:22000, img:'img/postres/fresas-crema.avif' },
    { id:'p16', name:'Raspao MD',                  price:18000, img:'img/postres/raspao.avif' },
    { id:'p17', name:'Cremoso de Brownie',         price:15000, img:'img/postres/cremoso-brownie.avif' },
  ]},
];

// ── ESTADO DEL PEDIDO ──
let pedido = []; // [{ id, name, price, img, qty }]

// ── PICKER ──
function openPicker() {
  const body = document.getElementById('picker-body');
  body.innerHTML = CATALOG.map(group => `
    <div class="picker-cat-title">${group.cat}</div>
    ${group.prods.map(p => `
      <div class="picker-item" onclick="addProduct('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},'${p.img}')">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${p.img}" alt="${p.name}" class="picker-thumb" onerror="this.style.display='none'">
          <div>
            <div class="picker-item-name">${p.name}</div>
            <div class="picker-item-price">${fmt(p.price)}</div>
          </div>
        </div>
        <button class="picker-item-add" aria-label="Agregar ${p.name}">+</button>
      </div>`).join('')}
  `).join('');
  document.getElementById('overlay').classList.add('open');
}

function closePicker() {
  document.getElementById('overlay').classList.remove('open');
}

function closePickerOuter(e) {
  if (e.target === document.getElementById('overlay')) closePicker();
}

function addProduct(id, name, price, img) {
  const ex = pedido.find(x => x.id === id);
  if (ex) { ex.qty++; }
  else     { pedido.push({ id, name, price, img, qty: 1 }); }
  renderPedido();
  closePicker();
}

// ── RENDER PEDIDO ──
function renderPedido() {
  const sel      = document.getElementById('prod-selector');
  const totalRow = document.getElementById('total-row');

  if (!pedido.length) {
    sel.innerHTML = '<div class="empty-sel" style="font-size:13px;color:var(--text-soft);text-align:center;padding:12px 0;">Aún no has agregado productos</div>';
    totalRow.style.display = 'none';
    return;
  }

  sel.innerHTML = pedido.map((item, i) => `
    <div class="prod-sel-item">
      <img src="${item.img}" alt="${item.name}" class="sel-thumb" onerror="this.style.display='none'">
      <span>${item.name}</span>
      <div class="sel-qty-row">
        <button class="sel-qty-btn" onclick="changeQty(${i},-1)" aria-label="Quitar uno">−</button>
        <span class="sel-qty-val">${item.qty}</span>
        <button class="sel-qty-btn" onclick="changeQty(${i},1)" aria-label="Agregar uno">+</button>
      </div>
      <span style="font-size:13px;color:var(--gold);min-width:64px;text-align:right;">${fmt(item.price * item.qty)}</span>
      <button class="sel-remove" onclick="removeItem(${i})" aria-label="Eliminar ${item.name}">
        <i class="ti ti-trash" aria-hidden="true"></i>
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

// ── ENVIAR POR WHATSAPP ──
function enviar() {
  const nombre = document.getElementById('inp-nombre').value.trim();
  const tel    = document.getElementById('inp-tel').value.trim();
  const dir    = document.getElementById('inp-dir').value.trim();
  const nota   = document.getElementById('inp-nota').value.trim();

  if (!nombre) { alert('Por favor ingresa tu nombre.'); return; }
  if (!tel)    { alert('Por favor ingresa tu teléfono.'); return; }
  if (!dir)    { alert('Por favor ingresa la dirección de entrega.'); return; }
  if (!pedido.length) { alert('Agrega al menos un producto a tu pedido.'); return; }

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

  // ← Reemplaza con el número real de WhatsApp del negocio (formato internacional sin +)
  const WA_NUMBER = '573242601994';
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
}
