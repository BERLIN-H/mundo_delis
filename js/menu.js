/**
 * MUNDO DELIS · Menu Page Logic
 * Archivo: js/menu.js
 */

async function init() {
  try {
    const [cats, conteoRows] = await Promise.all([
      sbGet('/categorias?select=*&order=orden.asc'),
      sbGet('/productos?select=categoria_id&visible=eq.true'),
    ]);

    const conteos = conteoRows.reduce((acc, p) => {
      acc[p.categoria_id] = (acc[p.categoria_id] || 0) + 1;
      return acc;
    }, {});

    const grid = document.getElementById('cat-grid');
    grid.innerHTML = cats.map(cat => {
      const n = conteos[cat.id] || 0;
      const countLabel = n > 0 ? `${n} producto${n !== 1 ? 's' : ''}` : 'Próximamente';
      return `
        <a href="/productos?cat=${cat.id}" class="cat-card">
          <div class="cat-icon"><i class="ti ${cat.icono}" aria-hidden="true"></i></div>
          <span class="cat-name">${cat.nombre}</span>
          <span class="cat-count">${countLabel}</span>
        </a>`;
    }).join('');

  } catch (e) {
    document.getElementById('cat-grid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:32px;color:#9B7A85">
        <i class="ti ti-wifi-off" style="font-size:32px;display:block;margin-bottom:8px"></i>
        No se pudo cargar el menú. Intenta de nuevo.
        <br><button onclick="location.reload()"
          style="margin-top:12px;padding:8px 20px;border-radius:10px;border:none;
                 background:#A87C3A;color:#fff;font-size:14px;cursor:pointer">
          Reintentar
        </button>
      </div>`;
    console.error(e);
  }
}

init();
