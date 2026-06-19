/**
 * MUNDO DELIS · Detalle Page Logic
 * Archivo: js/detalle.js
 */

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

    const cats = await sbGet(`/categorias?id=eq.${prod.categoria_id}&select=*`);
    const cat  = cats[0];

    document.title = `${prod.nombre} — Mundo Delis`;
    document.getElementById('top-title').textContent = cat?.nombre || '';
    document.getElementById('back-link').href = `productos.html?cat=${prod.categoria_id}`;

    const catIcon = cat?.icono || 'ti-rosette';
    const badge   = badgeHtml(prod, newDays);

    document.getElementById('detail-content').innerHTML = `
      <div class="detail-hero">
        <img src="${prod.imagen_url}" alt="${prod.nombre}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <i class="ti ${catIcon}" aria-hidden="true" style="display:none"></i>
      </div>
      <div class="detail-body">
        <div class="detail-name">${prod.nombre}</div>
        ${badge ? `<div class="detail-badges">${badge}</div>` : ''}
        <p class="detail-desc">${prod.desc_larga || prod.desc_corta}</p>
        <div class="detail-price-row">
          <span class="detail-price-label">Precio</span>
          <span class="detail-price">${fmt(prod.precio)}</span>
        </div>
        <div class="detail-note">
          <i class="ti ti-info-circle" aria-hidden="true"></i>
          <span>¿Te antojaste? Puedes pedirlo a domicilio desde la sección <strong>Domicilios</strong> o acercarte a nuestro local.</span>
        </div>
        <a href="domicilios.html" class="home-btn home-btn-gold" style="margin-top:16px;display:flex;">
          <i class="ti ti-motorbike" aria-hidden="true"></i> Pedir a domicilio
        </a>
      </div>
      <div class="pb"></div>`;

  } catch (e) {
    showError('No se pudo cargar el producto');
    console.error(e);
  }
}

function showError(msg) {
  document.getElementById('detail-content').innerHTML = `
    <div class="empty-state">
      <i class="ti ti-alert-circle"></i>
      <h3>${msg}</h3>
      <p><a href="menu.html" style="color:#A87C3A">← Volver al menú</a></p>
    </div>`;
}

init();
