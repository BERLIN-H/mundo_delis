/**
 * MUNDO DELIS · Productos Page Logic
 * Archivo: js/productos.js
 */

// Skeletons mientras carga
const skelEl = document.getElementById('skeletons');
for (let i = 0; i < 5; i++) {
  const d = document.createElement('div');
  d.className = 'prod-skeleton';
  skelEl.appendChild(d);
}

async function init() {
  const params = new URLSearchParams(location.search);
  const catId  = params.get('cat') || 'galleteria';

  try {
    const [cats, prods, ajustes] = await Promise.all([
      sbGet(`/categorias?id=eq.${catId}&select=*`),
      sbGet(`/productos?categoria_id=eq.${catId}&visible=eq.true&order=created_at.asc&select=*`),
      sbGet(`/ajustes?clave=eq.new_days&select=valor`),
    ]);

    const cat     = cats[0];
    const newDays = ajustes[0]?.valor || '14';

    if (!cat) {
      document.getElementById('prod-list').innerHTML = emptyState('Categoría no encontrada');
      return;
    }

    document.title = `${cat.nombre} — Mundo Delis`;
    document.getElementById('top-title').textContent = cat.nombre;

    document.getElementById('cat-header-wrap').innerHTML = `
      <div class="cat-header">
        <div class="cat-header-icon"><i class="ti ${cat.icono}" aria-hidden="true"></i></div>
        <div class="cat-header-text">
          <h2>${cat.nombre}</h2>
          ${cat.descripcion ? `<p>${cat.descripcion}</p>` : ''}
        </div>
      </div>`;

    const listEl = document.getElementById('prod-list');

    if (!prods.length) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-clock" aria-hidden="true"></i>
          <h3>Próximamente</h3>
          <p>Estamos preparando esta sección<br>con mucho amor 🩷</p>
        </div>`;
      return;
    }

    listEl.innerHTML = prods.map(p => {
      const badge = badgeHtml(p, newDays);
      return `
        <a class="prod-item" href="/detalle?id=${p.id}">
          <div class="prod-thumb">
            <img src="${p.imagen_url}" alt="${p.nombre}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <i class="ti ${cat.icono}" aria-hidden="true" style="display:none"></i>
          </div>
          <div class="prod-info">
            <div class="prod-name">${p.nombre}${badge}</div>
            <div class="prod-desc">${p.desc_corta}</div>
          </div>
          <span class="prod-price">${fmt(p.precio)}</span>
        </a>`;
    }).join('');

  } catch (e) {
    document.getElementById('prod-list').innerHTML = `
      <div class="empty-state">
        <i class="ti ti-wifi-off"></i>
        <h3>Sin conexión</h3>
        <p>No se pudieron cargar los productos.<br>
           <button onclick="location.reload()"
             style="margin-top:10px;padding:8px 18px;border-radius:10px;border:none;
                    background:#A87C3A;color:#fff;font-size:13px;cursor:pointer">
             Reintentar
           </button>
        </p>
      </div>`;
    console.error(e);
  }
}

function emptyState(msg) {
  return `<div class="empty-state"><i class="ti ti-alert-circle"></i><h3>${msg}</h3></div>`;
}

init();
