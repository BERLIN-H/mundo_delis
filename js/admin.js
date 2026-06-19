/**
 * MUNDO DELIS · Admin Panel Logic
 * Archivo: js/admin.js
 */

const SUPABASE_URL  = window.SUPABASE_URL;
const SUPABASE_ANON = window.SUPABASE_ANON;

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

let SESSION     = null;
let STATE       = { cats: [], prods: [], newDays: 14 };
let activeTab   = 'resumen';
let activeFilter = 'all';

// ── API CALL (a Netlify Function) ──
async function api(action, payload) {
  const token = SESSION?.access_token;
  const r = await fetch('/api/admin-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload, token }),
  });
  const json = await r.json();
  if (!r.ok || json.error) throw new Error(json.error || 'Error de servidor');
  return json.data;
}

// ── SUPABASE GET (lectura pública) ──
async function sbGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': `Bearer ${SESSION?.access_token || SUPABASE_ANON}`,
    }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ══════════════════════════════════════════════════════
//  VERIFICACIÓN DE SESIÓN (auto-ejecuta al cargar)
// ══════════════════════════════════════════════════════
(async () => {
  // Procesar callback de Google OAuth (tokens en el hash de la URL)
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  if (hashParams.get('access_token')) {
    await sb.auth.setSession({
      access_token:  hashParams.get('access_token'),
      refresh_token: hashParams.get('refresh_token'),
    });
    window.history.replaceState(null, '', window.location.pathname);
  }

  // getUser() consulta el servidor — trae el rol más reciente
  const { data: { user }, error: userError } = await sb.auth.getUser();

  if (userError || !user) {
    window.location.href = '/login';
    return;
  }

  const rol = user.app_metadata?.rol || user.user_metadata?.rol;
  if (rol !== 'ADMIN') {
    await sb.auth.signOut();
    window.location.href = '/login?err=no-admin';
    return;
  }

  const { data: { session } } = await sb.auth.getSession();
  SESSION = session;

  const email  = user.email;
  const name   = user.user_metadata?.nombre || user.user_metadata?.full_name || email;
  const avatar = user.user_metadata?.avatar_url;

  document.getElementById('user-email-bar').textContent = name;
  document.getElementById('session-user-label').textContent = email;
  document.getElementById('session-role-label').textContent = `Rol: ADMIN · ${name}`;

  if (avatar) {
    document.getElementById('user-avatar-wrap').innerHTML = `<img src="${avatar}" alt="Avatar">`;
  }

  document.getElementById('auth-gate').style.display = 'none';
  document.getElementById('admin-wrap').classList.add('visible');

  await loadAll();
  renderResumen();

  sb.auth.onAuthStateChange((event, s) => {
    if (event === 'SIGNED_OUT') window.location.href = '/login';
    if (s) SESSION = s;
  });
})();

async function doLogout() {
  await sb.auth.signOut();
  window.location.href = '/login';
}

// ══════════════════════════════════════════════════════
//  CARGA DE DATOS
// ══════════════════════════════════════════════════════
async function loadAll() {
  showLoading(true);
  try {
    const [cats, prods, ajustes] = await Promise.all([
      sbGet('/categorias?select=*&order=orden.asc'),
      sbGet('/productos?select=*&order=created_at.desc'),
      sbGet('/ajustes?select=*'),
    ]);
    STATE.cats    = cats;
    STATE.prods   = prods;
    STATE.newDays = parseInt(ajustes.find(a => a.clave === 'new_days')?.valor || '14');
    document.getElementById('new-days-val').value = STATE.newDays;
  } finally {
    showLoading(false);
  }
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
function fmt(n) { return '$' + parseInt(n).toLocaleString('es-CO'); }

function esNuevo(p) {
  if (!p.created_at) return false;
  return (Date.now() - new Date(p.created_at).getTime()) < STATE.newDays * 86400000;
}
function mostrarNuevo(p) { return p.badge === 'new' || (p.badge_new_auto && esNuevo(p)); }
function catNombre(id)   { return STATE.cats.find(c => c.id === id)?.nombre || id; }
function catIcono(id)    { return STATE.cats.find(c => c.id === id)?.icono  || 'ti-category'; }

// ══════════════════════════════════════════════════════
//  NAVEGACIÓN POR TABS
// ══════════════════════════════════════════════════════
function switchTab(id) {
  activeTab = id;
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', ['resumen', 'productos', 'categorias', 'ajustes'][i] === id));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  if (id === 'resumen')    renderResumen();
  if (id === 'productos')  renderProdList();
  if (id === 'categorias') renderCatList();
}

// ══════════════════════════════════════════════════════
//  RENDER: RESUMEN
// ══════════════════════════════════════════════════════
function renderResumen() {
  const total = STATE.prods.length;
  const vis   = STATE.prods.filter(p => p.visible).length;
  const newC  = STATE.prods.filter(p => mostrarNuevo(p)).length;
  const cats  = new Set(STATE.prods.filter(p => p.visible).map(p => p.categoria_id)).size;
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Productos totales</div></div>
    <div class="stat-card"><div class="stat-num">${vis}</div><div class="stat-label">Visibles en menú</div></div>
    <div class="stat-card"><div class="stat-num">${newC}</div><div class="stat-label">Marcados "Nuevo"</div></div>
    <div class="stat-card"><div class="stat-num">${cats}</div><div class="stat-label">Categorías activas</div></div>`;
  document.getElementById('recent-list').innerHTML =
    STATE.prods.slice(0, 5).map(prodCardHtml).join('') || emptyState('No hay productos');
}

// ══════════════════════════════════════════════════════
//  RENDER: PRODUCTOS
// ══════════════════════════════════════════════════════
function renderProdList() {
  document.getElementById('filter-bar').innerHTML =
    `<button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">Todos</button>` +
    STATE.cats.map(c =>
      `<button class="filter-chip ${activeFilter === c.id ? 'active' : ''}" onclick="setFilter('${c.id}')">${c.nombre}</button>`
    ).join('');
  const list = activeFilter === 'all' ? STATE.prods : STATE.prods.filter(p => p.categoria_id === activeFilter);
  document.getElementById('prod-list').innerHTML =
    list.map(prodCardHtml).join('') || emptyState('No hay productos en esta categoría');
}

function setFilter(f) { activeFilter = f; renderProdList(); }

function prodCardHtml(p) {
  const badges = [
    mostrarNuevo(p) ? '<span class="badge-new-admin">✨ Nuevo</span>' : '',
    p.badge === 'rec' ? '<span class="badge-rec-admin">⭐ Recomendado</span>' : '',
    !p.visible ? '<span class="badge-hidden">Oculto</span>' : '',
  ].join('');
  return `
  <div class="prod-admin-card">
    <div class="prod-admin-thumb">
      <img src="${p.imagen_url || ''}" alt="${p.nombre}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <i class="ti ${catIcono(p.categoria_id)}" style="display:none"></i>
    </div>
    <div class="prod-admin-info">
      <div class="prod-admin-name">${p.nombre}</div>
      <div class="prod-admin-cat">${catNombre(p.categoria_id)}</div>
      <div class="prod-admin-price">${fmt(p.precio)}</div>
      <div class="prod-admin-badges">${badges}</div>
    </div>
    <div class="prod-admin-actions">
      <button class="icon-btn" onclick="openEditModal('${p.id}')"><i class="ti ti-edit"></i></button>
      <button class="icon-btn" onclick="toggleVisible('${p.id}')">
        <i class="ti ${p.visible ? 'ti-eye' : 'ti-eye-off'}"></i>
      </button>
      <button class="icon-btn danger" onclick="confirmDelete('${p.id}')"><i class="ti ti-trash"></i></button>
    </div>
  </div>`;
}

function emptyState(m) {
  return `<div class="empty-admin"><i class="ti ti-package-off"></i><p>${m}</p></div>`;
}

// ══════════════════════════════════════════════════════
//  RENDER: CATEGORÍAS
// ══════════════════════════════════════════════════════
function renderCatList() {
  document.getElementById('cat-list').innerHTML = STATE.cats.map(c => {
    const n = STATE.prods.filter(p => p.categoria_id === c.id).length;
    return `
    <div class="prod-admin-card">
      <div class="prod-admin-thumb" style="background:var(--gold-light)">
        <i class="ti ${c.icono}" style="font-size:24px;color:var(--gold)"></i>
      </div>
      <div class="prod-admin-info">
        <div class="prod-admin-name">${c.nombre}</div>
        <div class="prod-admin-cat">${n} producto${n !== 1 ? 's' : ''} · orden ${c.orden}</div>
        ${c.descripcion ? `<div class="prod-admin-cat">${c.descripcion}</div>` : ''}
      </div>
      <div class="prod-admin-actions">
        <button class="icon-btn" onclick="openEditCat('${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="icon-btn danger" onclick="confirmDeleteCat('${c.id}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`;
  }).join('') || emptyState('No hay categorías');
}

// ══════════════════════════════════════════════════════
//  MODAL: PRODUCTO
// ══════════════════════════════════════════════════════
function openAddModal() {
  document.getElementById('edit-id').value = '';
  document.getElementById('modal-title').textContent = 'Agregar producto';
  ['f-name','f-price','f-desc-short','f-desc-long','f-img','f-img-url'].forEach(id =>
    document.getElementById(id).value = '');
  document.getElementById('img-preview-img').style.display = 'none';
  document.getElementById('img-progress').style.display = 'none';
  document.getElementById('t-auto-new').classList.add('on');
  document.getElementById('t-new').classList.remove('on');
  document.getElementById('t-rec').classList.remove('on');
  document.getElementById('t-visible').classList.add('on');
  document.getElementById('f-cat').innerHTML =
    STATE.cats.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  openModal('prod-modal');
}

function openEditModal(id) {
  const p = STATE.prods.find(x => x.id === id);
  if (!p) return;
  document.getElementById('edit-id').value   = p.id;
  document.getElementById('modal-title').textContent = 'Editar producto';
  document.getElementById('f-name').value        = p.nombre;
  document.getElementById('f-price').value       = p.precio;
  document.getElementById('f-desc-short').value  = p.desc_corta || '';
  document.getElementById('f-desc-long').value   = p.desc_larga || '';
  document.getElementById('f-img').value         = p.imagen_url || '';
  document.getElementById('f-img-url').value     = p.imagen_url || '';
  document.getElementById('img-progress').style.display = 'none';
  const imgEl = document.getElementById('img-preview-img');
  if (p.imagen_url) { imgEl.src = p.imagen_url; imgEl.style.display = 'block'; }
  else imgEl.style.display = 'none';
  document.getElementById('t-auto-new').classList.toggle('on', p.badge_new_auto !== false);
  document.getElementById('t-new').classList.toggle('on', p.badge === 'new');
  document.getElementById('t-rec').classList.toggle('on', p.badge === 'rec');
  document.getElementById('t-visible').classList.toggle('on', p.visible !== false);
  document.getElementById('f-cat').innerHTML =
    STATE.cats.map(c => `<option value="${c.id}" ${c.id === p.categoria_id ? 'selected' : ''}>${c.nombre}</option>`).join('');
  openModal('prod-modal');
}

async function saveProduct() {
  const name  = document.getElementById('f-name').value.trim();
  const price = parseInt(document.getElementById('f-price').value);
  const cat   = document.getElementById('f-cat').value;
  if (!name) { showToast('El nombre es obligatorio', true); return; }
  if (!price || price < 0) { showToast('Precio no válido', true); return; }
  const payload = {
    categoria_id:  cat,
    nombre:        name,
    precio:        price,
    desc_corta:    document.getElementById('f-desc-short').value.trim(),
    desc_larga:    document.getElementById('f-desc-long').value.trim(),
    imagen_url:    document.getElementById('f-img').value || document.getElementById('f-img-url').value,
    badge:         document.getElementById('t-rec').classList.contains('on') ? 'rec'
                 : document.getElementById('t-new').classList.contains('on') ? 'new' : '',
    badge_new_auto: document.getElementById('t-auto-new').classList.contains('on'),
    visible:        document.getElementById('t-visible').classList.contains('on'),
  };
  const editId = document.getElementById('edit-id').value;
  const btn = document.getElementById('save-prod-btn');
  btn.disabled = true; showLoading(true);
  try {
    if (editId) {
      const rows = await api('productos.update', { id: editId, ...payload });
      const idx  = STATE.prods.findIndex(p => p.id === editId);
      if (idx >= 0) STATE.prods[idx] = rows[0] || { ...STATE.prods[idx], ...payload };
      showToast('Producto actualizado ✓');
    } else {
      const rows = await api('productos.insert', payload);
      if (rows[0]) STATE.prods.unshift(rows[0]);
      showToast('Producto agregado ✓');
    }
    closeModal('prod-modal'); renderCurrentTab();
  } catch (e) { showToast('Error: ' + e.message, true); }
  finally { btn.disabled = false; showLoading(false); }
}

// ══════════════════════════════════════════════════════
//  MODAL: CATEGORÍA
// ══════════════════════════════════════════════════════
function openCatModal() {
  document.getElementById('cat-edit-id').value = '';
  document.getElementById('cat-modal-title').textContent = 'Nueva categoría';
  ['cat-name','cat-icon','cat-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cat-orden').value = Math.max(...STATE.cats.map(c => c.orden || 0), 0) + 1;
  openModal('cat-modal');
}

function openEditCat(id) {
  const c = STATE.cats.find(x => x.id === id);
  if (!c) return;
  document.getElementById('cat-edit-id').value     = c.id;
  document.getElementById('cat-modal-title').textContent = 'Editar categoría';
  document.getElementById('cat-name').value  = c.nombre;
  document.getElementById('cat-icon').value  = c.icono;
  document.getElementById('cat-desc').value  = c.descripcion || '';
  document.getElementById('cat-orden').value = c.orden || 99;
  openModal('cat-modal');
}

async function saveCat() {
  const name = document.getElementById('cat-name').value.trim();
  if (!name) { showToast('El nombre es obligatorio', true); return; }
  const editId = document.getElementById('cat-edit-id').value;
  const payload = {
    nombre:      name,
    icono:       document.getElementById('cat-icon').value.trim() || 'ti-category',
    descripcion: document.getElementById('cat-desc').value.trim(),
    orden:       parseInt(document.getElementById('cat-orden').value) || 99,
  };
  const btn = document.getElementById('save-cat-btn');
  btn.disabled = true; showLoading(true);
  try {
    if (editId) {
      await api('categorias.update', { id: editId, ...payload });
      const idx = STATE.cats.findIndex(c => c.id === editId);
      if (idx >= 0) STATE.cats[idx] = { ...STATE.cats[idx], ...payload };
      showToast('Categoría actualizada ✓');
    } else {
      const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const rows = await api('categorias.insert', { id, ...payload });
      if (rows[0]) { STATE.cats.push(rows[0]); STATE.cats.sort((a, b) => (a.orden || 99) - (b.orden || 99)); }
      showToast('Categoría creada ✓');
    }
    closeModal('cat-modal'); renderCurrentTab();
  } catch (e) { showToast('Error: ' + e.message, true); }
  finally { btn.disabled = false; showLoading(false); }
}

// ══════════════════════════════════════════════════════
//  ACCIONES: VISIBILIDAD / ELIMINAR
// ══════════════════════════════════════════════════════
async function toggleVisible(id) {
  const p = STATE.prods.find(x => x.id === id);
  if (!p) return;
  showLoading(true);
  try {
    await api('productos.update', { id, visible: !p.visible });
    p.visible = !p.visible;
    showToast(p.visible ? 'Producto visible ✓' : 'Producto oculto ✓');
    renderCurrentTab();
  } catch (e) { showToast('Error: ' + e.message, true); }
  finally { showLoading(false); }
}

function confirmDelete(id) {
  const p = STATE.prods.find(x => x.id === id);
  document.getElementById('confirm-title').textContent = '¿Eliminar producto?';
  document.getElementById('confirm-desc').textContent  = `"${p?.nombre}" se eliminará permanentemente.`;
  document.getElementById('confirm-ok').textContent    = 'Eliminar';
  document.getElementById('confirm-ok').onclick = async () => {
    closeConfirm(); showLoading(true);
    try {
      await api('productos.delete', { id });
      STATE.prods = STATE.prods.filter(x => x.id !== id);
      showToast('Producto eliminado ✓'); renderCurrentTab();
    } catch (e) { showToast('Error: ' + e.message, true); }
    finally { showLoading(false); }
  };
  document.getElementById('confirm-overlay').classList.add('open');
}

function confirmDeleteCat(id) {
  const c = STATE.cats.find(x => x.id === id);
  const n = STATE.prods.filter(p => p.categoria_id === id).length;
  document.getElementById('confirm-title').textContent = '¿Eliminar categoría?';
  document.getElementById('confirm-desc').textContent  = `"${c?.nombre}" tiene ${n} producto${n !== 1 ? 's' : ''}. Los productos quedarán sin categoría.`;
  document.getElementById('confirm-ok').textContent    = 'Eliminar';
  document.getElementById('confirm-ok').onclick = async () => {
    closeConfirm(); showLoading(true);
    try {
      await api('categorias.delete', { id });
      STATE.cats = STATE.cats.filter(x => x.id !== id);
      showToast('Categoría eliminada ✓'); renderCurrentTab();
    } catch (e) { showToast('Error: ' + e.message, true); }
    finally { showLoading(false); }
  };
  document.getElementById('confirm-overlay').classList.add('open');
}
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); }

// ══════════════════════════════════════════════════════
//  AJUSTES
// ══════════════════════════════════════════════════════
async function saveNewDays() {
  const v = parseInt(document.getElementById('new-days-val').value);
  if (!v || v < 1) { showToast('Valor no válido', true); return; }
  showLoading(true);
  try {
    await api('ajustes.update', { clave: 'new_days', valor: String(v) });
    STATE.newDays = v;
    showToast('Guardado ✓');
  } catch (e) { showToast('Error: ' + e.message, true); }
  finally { showLoading(false); }
}

async function exportData() {
  const fecha = new Date().toISOString().slice(0, 10);

  // ── Construir filas enriquecidas con nombre de categoría ──
  const filas = STATE.prods.map(p => ({
    id:          p.id,
    nombre:      p.nombre,
    categoria:   catNombre(p.categoria_id),
    precio:      p.precio,
    desc_corta:  p.desc_corta  || '',
    desc_larga:  p.desc_larga  || '',
    imagen_url:  p.imagen_url  || '',
    badge:       p.badge       || '',
    visible:     p.visible ? 'Sí' : 'No',
    creado:      p.created_at  ? p.created_at.slice(0, 10) : '',
  }));

  // ── CSV ──
  const cols = ['id','nombre','categoria','precio','desc_corta','desc_larga','imagen_url','badge','visible','creado'];
  const csvHead = cols.join(';');
  const csvRows = filas.map(f =>
    cols.map(c => `"${String(f[c]).replace(/"/g,'""')}"`).join(';')
  );
  const csvContent = [csvHead, ...csvRows].join('\n');
  const bom = '\uFEFF'; // BOM para que Excel abra bien el UTF-8
  descargar(bom + csvContent, `mundo-delis-productos-${fecha}.csv`, 'text/csv;charset=utf-8');

  showToast('Productos exportados como CSV ✓');
}

function descargar(contenido, nombre, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ══════════════════════════════════════════════════════
//  IMAGEN UPLOAD
// ══════════════════════════════════════════════════════
async function handleImgFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('img-preview-img');
    img.src = e.target.result; img.style.display = 'block';
  };
  reader.readAsDataURL(file);
  const prog = document.getElementById('img-progress');
  prog.style.display = 'block';
  prog.textContent = '⬆️ Subiendo imagen…';
  prog.style.color = 'var(--gold)';
  try {
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `productos/${Date.now()}.${ext}`;
    const { signedURL } = await api('storage.signedUpload', { path });
    const uploadRes = await fetch(signedURL, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'x-upsert': 'true' },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Error subiendo la imagen');
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/imagenes/${path}`;
    document.getElementById('f-img').value     = publicUrl;
    document.getElementById('f-img-url').value = publicUrl;
    prog.textContent = '✅ Imagen subida';
    setTimeout(() => { prog.style.display = 'none'; }, 2000);
  } catch (e) {
    prog.textContent = '❌ Error: ' + e.message;
    prog.style.color = 'var(--danger)';
  }
}

function syncImgUrl(val) {
  document.getElementById('f-img').value = val;
  const img = document.getElementById('img-preview-img');
  if (val) { img.src = val; img.style.display = 'block'; } else img.style.display = 'none';
}

// ══════════════════════════════════════════════════════
//  UTILS UI
// ══════════════════════════════════════════════════════
function toggleBtn(el)   { el.classList.toggle('on'); }
function openModal(id)   { document.getElementById(id).classList.add('open'); }
function closeModal(id)  { document.getElementById(id).classList.remove('open'); }
function showLoading(v)  { document.getElementById('loading-overlay').classList.toggle('open', v); }

document.querySelectorAll('.modal-overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); })
);

function renderCurrentTab() {
  if (activeTab === 'resumen')    renderResumen();
  if (activeTab === 'productos')  renderProdList();
  if (activeTab === 'categorias') renderCatList();
}

let toastTimer;
function showToast(msg, isErr = false) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.querySelector('i').className = isErr ? 'ti ti-alert-circle' : 'ti ti-check';
  t.style.background = isErr ? 'var(--danger)' : 'var(--text)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}
