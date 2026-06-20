/**
 * MUNDO DELIS · Detalle Page Logic
 * Archivo: js/detalle.js
 */

// Estado de selección de opciones: { opcionId: valorId }
const seleccion = {};
let OPCIONES = [];   // [{ id, titulo, obligatorio, valores: [{id, etiqueta, precio_extra}] }]
let PROD = null;

async function init() {
  const params = new URLSearchParams(location.search);
  const prodId = params.get('id');

  if (!prodId) {
    showError('Producto no especificado');
    return;
  }

  try {
    const [prods, ajustes] = await Promise.all([
      sbGet(`/productos?id=eq.${prodId}&visible=eq.true&select=*`),
      sbGet(`/ajustes?clave=eq.new_days&select=valor`),
    ]);

    const prod    = prods[0];
    const newDays = ajustes[0]?.valor || '14';

    if (!prod) { showError('Producto no encontrado'); return; }
    PROD = prod;

    const [cats, opciones] = await Promise.all([
      sbGet(`/categorias?id=eq.${prod.categoria_id}&select=*`),
      sbGet(`/producto_opciones?producto_id=eq.${prod.id}&order=orden.asc&select=*,producto_opciones_valores(*)`),
    ]);
    const cat = cats[0];

    // Normaliza y ordena los valores de cada grupo de opciones
    OPCIONES = (opciones || []).map(op => ({
      id: op.id,
      titulo: op.titulo,
      obligatorio: op.obligatorio,
      valores: (op.producto_opciones_valores || [])
        .slice()
        .sort((a, b) => a.orden - b.orden),
    }));

    document.title = `${prod.nombre} — Mundo Delis`;
    document.getElementById('top-title').textContent = cat?.nombre || '';
    document.getElementById('back-link').href = `/productos?cat=${prod.categoria_id}`;

    const catIcon = cat?.icono || 'ti-rosette';
    const badge   = badgeHtml(prod, newDays);
    const tieneImg = prod.imagen_url && prod.imagen_url.trim() !== '';

    document.getElementById('detail-content').innerHTML = `
      <div class="detail-hero">
        ${tieneImg
          ? `<img src="${prod.imagen_url}" alt="${prod.nombre}"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
          : ''}
        <i class="ti ${catIcon}" aria-hidden="true" style="display:${tieneImg ? 'none' : 'flex'}"></i>
      </div>
      <div class="detail-body">
        <div class="detail-name">${prod.nombre}</div>
        ${badge ? `<div class="detail-badges">${badge}</div>` : ''}
        <p class="detail-desc">${prod.desc_larga || prod.desc_corta}</p>
        <div id="opt-groups"></div>
        <div class="detail-price-row">
          <span class="detail-price-label">Precio</span>
          <span class="detail-price" id="detail-price">${fmt(prod.precio)}</span>
        </div>
        <div class="detail-note">
          <i class="ti ti-info-circle" aria-hidden="true"></i>
          <span>¿Te antojaste? Puedes pedirlo a domicilio desde la sección <strong>Domicilios</strong> o acercarte a nuestro local.</span>
        </div>
        <button class="home-btn home-btn-gold" id="btn-domicilio" style="margin-top:16px;display:flex;width:100%;border:none;cursor:pointer;"
          onclick="irADomicilio()">
          <i class="ti ti-motorbike" aria-hidden="true"></i> Pedir a domicilio
        </button>
      </div>
      <div class="pb"></div>`;

    renderOpciones();

  } catch (e) {
    showError('No se pudo cargar el producto');
    console.error(e);
  }
}

// ── Renderiza los grupos de opciones como chips seleccionables ──
function renderOpciones() {
  const wrap = document.getElementById('opt-groups');
  if (!OPCIONES.length) { wrap.innerHTML = ''; return; }

  wrap.innerHTML = OPCIONES.map(op => `
    <div class="opt-group" id="optgroup-${op.id}">
      <span class="opt-group-title">${op.titulo}</span>
      ${op.obligatorio ? '<span class="opt-group-required">Elige una opción</span>' : ''}
      <div class="opt-chip-row">
        ${op.valores.map(v => `
          <button type="button" class="opt-chip" id="chip-${v.id}"
            onclick="elegirOpcion('${op.id}','${v.id}')">
            ${v.etiqueta}${v.precio_extra > 0 ? `<span class="extra">+${fmt(v.precio_extra)}</span>` : ''}
          </button>`).join('')}
      </div>
      <span class="opt-missing-hint" id="hint-${op.id}">Por favor elige una opción</span>
    </div>`).join('');

  actualizarPrecio();
}

function elegirOpcion(opcionId, valorId) {
  seleccion[opcionId] = valorId;

  const op = OPCIONES.find(o => o.id === opcionId);
  op.valores.forEach(v => {
    document.getElementById(`chip-${v.id}`).classList.toggle('selected', v.id === valorId);
  });
  document.getElementById(`hint-${opcionId}`).classList.remove('show');

  actualizarPrecio();
}

function actualizarPrecio() {
  let total = PROD.precio;
  OPCIONES.forEach(op => {
    const valorId = seleccion[op.id];
    if (!valorId) return;
    const val = op.valores.find(v => v.id === valorId);
    if (val) total += val.precio_extra;
  });
  document.getElementById('detail-price').textContent = fmt(total);
}

// ── Valida que todas las opciones obligatorias estén elegidas y navega a domicilios ──
function irADomicilio() {
  const faltantes = OPCIONES.filter(op => op.obligatorio && !seleccion[op.id]);

  if (faltantes.length) {
    faltantes.forEach(op => document.getElementById(`hint-${op.id}`).classList.add('show'));
    document.getElementById(`optgroup-${faltantes[0].id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Construye un resumen legible de las opciones elegidas, ej: "Escoge el postre: Cuatro Leches"
  const detalles = OPCIONES
    .filter(op => seleccion[op.id])
    .map(op => {
      const val = op.valores.find(v => v.id === seleccion[op.id]);
      return `${op.titulo}: ${val.etiqueta}`;
    });

  // Pasa los datos a domicilios.html vía sessionStorage para preseleccionar el producto
  sessionStorage.setItem('md_prefill', JSON.stringify({
    id: PROD.id,
    nombre: PROD.nombre,
    precio: parseInt(document.getElementById('detail-price').textContent.replace(/[^\d]/g, '')),
    img: PROD.imagen_url,
    opciones: detalles,
  }));

  location.href = '/domicilios';
}

function showError(msg) {
  document.getElementById('detail-content').innerHTML = `
    <div class="empty-state">
      <i class="ti ti-alert-circle"></i>
      <h3>${msg}</h3>
      <p><a href="/menu" style="color:#A87C3A">← Volver al menú</a></p>
    </div>`;
}

init();