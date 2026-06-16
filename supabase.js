const SUPABASE_URL     = 'https://sylkotirzlhrwybqelis.supabase.co';
const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bGtvdGlyemxocnd5YnFlbGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDc4NDgsImV4cCI6MjA5NzEyMzg0OH0.ZabkKV_X_XizS-c1ZUkWFGZ9xIaHjaW9gzuVrn3v0Kg';          // pública — solo lectura en producción
const SUPABASE_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bGtvdGlyemxocnd5YnFlbGlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTU0Nzg0OCwiZXhwIjoyMDk3MTIzODQ4fQ.xkvZNMJ75ukVrNRxybYmRu3hBaDnqiE4BeQteb2pUV8';  // privada — solo en admin.html

// ── STORAGE ───────────────────────────────────────────────────
const BUCKET = 'imagenes';
export const storageBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

// ── CLIENTE HTTP ──────────────────────────────────────────────
function headers(useService = false) {
  return {
    'Content-Type': 'application/json',
    'apikey':        useService ? SUPABASE_SERVICE : SUPABASE_ANON,
    'Authorization': `Bearer ${useService ? SUPABASE_SERVICE : SUPABASE_ANON}`,
    'Prefer':        'return=representation',
  };
}

const base = `${SUPABASE_URL}/rest/v1`;

// ── HELPERS PÚBLICOS (solo lectura, anon key) ─────────────────

/** Trae todas las categorías ordenadas */
export async function getCategorias() {
  const r = await fetch(`${base}/categorias?select=*&order=orden.asc`, { headers: headers() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Cuenta productos visibles por categoría */
export async function getConteosPorCat() {
  // Supabase no tiene GROUP BY en REST, traemos todos los visible=true y contamos en JS
  const r = await fetch(`${base}/productos?select=categoria_id&visible=eq.true`, { headers: headers() });
  if (!r.ok) return {};
  const rows = await r.json();
  return rows.reduce((acc, p) => { acc[p.categoria_id] = (acc[p.categoria_id] || 0) + 1; return acc; }, {});
}

/** Trae productos visibles de una categoría */
export async function getProductosCat(catId) {
  const r = await fetch(
    `${base}/productos?categoria_id=eq.${catId}&visible=eq.true&order=created_at.asc&select=*`,
    { headers: headers() }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Trae un producto por id */
export async function getProducto(id) {
  const r = await fetch(`${base}/productos?id=eq.${id}&select=*`, { headers: headers() });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0] || null;
}

/** Lee un ajuste por clave */
export async function getAjuste(clave) {
  const r = await fetch(`${base}/ajustes?clave=eq.${clave}&select=valor`, { headers: headers() });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0]?.valor ?? null;
}

/** Calcula si un producto muestra badge "Nuevo" automático */
export function esNuevo(producto, newDays) {
  if (!producto.created_at) return false;
  const dias = parseInt(newDays) || 14;
  const ms = dias * 86400 * 1000;
  return (Date.now() - new Date(producto.created_at).getTime()) < ms;
}

// ── HELPERS ADMIN (escritura, service key) ────────────────────

/** Trae TODOS los productos (incluyendo ocultos) */
export async function getAllProductos() {
  const r = await fetch(`${base}/productos?select=*&order=created_at.desc`, { headers: headers(true) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Crea un producto */
export async function crearProducto(data) {
  const r = await fetch(`${base}/productos`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

/** Actualiza un producto */
export async function actualizarProducto(id, data) {
  const r = await fetch(`${base}/productos?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Elimina un producto */
export async function eliminarProducto(id) {
  const r = await fetch(`${base}/productos?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers(true),
  });
  if (!r.ok) throw new Error(await r.text());
  return true;
}

/** Trae todas las categorías (admin) */
export async function getAllCategorias() {
  const r = await fetch(`${base}/categorias?select=*&order=orden.asc`, { headers: headers(true) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Crea una categoría */
export async function crearCategoria(data) {
  const r = await fetch(`${base}/categorias`, {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  const rows = await r.json();
  return rows[0];
}

/** Actualiza una categoría */
export async function actualizarCategoria(id, data) {
  const r = await fetch(`${base}/categorias?id=eq.${id}`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Elimina una categoría */
export async function eliminarCategoria(id) {
  const r = await fetch(`${base}/categorias?id=eq.${id}`, {
    method: 'DELETE',
    headers: headers(true),
  });
  if (!r.ok) throw new Error(await r.text());
  return true;
}

/** Lee un ajuste (admin) */
export async function getAllAjustes() {
  const r = await fetch(`${base}/ajustes?select=*`, { headers: headers(true) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Guarda/actualiza un ajuste */
export async function setAjuste(clave, valor) {
  const r = await fetch(`${base}/ajustes?clave=eq.${clave}`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify({ valor }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ── STORAGE: subida de imágenes ───────────────────────────────

/**
 * Sube un File al Storage de Supabase.
 * Devuelve la URL pública.
 * @param {File} file
 * @param {string} carpeta  ej: 'postres' o 'galleteria'
 */
export async function subirImagen(file, carpeta = 'productos') {
  const ext  = file.name.split('.').pop();
  const path = `${carpeta}/${Date.now()}.${ext}`;
  const r = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
    {
      method: 'POST',
      headers: {
        'apikey':        SUPABASE_SERVICE,
        'Authorization': `Bearer ${SUPABASE_SERVICE}`,
        'Content-Type':  file.type,
        'x-upsert':      'true',
      },
      body: file,
    }
  );
  if (!r.ok) throw new Error(await r.text());
  return `${storageBase}${path}`;
}

/** Formatea precio en COP */
export function fmt(n) {
  return '$' + parseInt(n).toLocaleString('es-CO');
}
