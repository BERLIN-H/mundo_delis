/**
 * MUNDO DELIS · Shared Utilities
 * Archivo: js/utils.js
 * Funciones compartidas entre páginas frontend
 */

/** Fetch simple al REST API de Supabase con anon key */
async function sbGet(path) {
  const r = await fetch(`${window.SUPABASE_URL}/rest/v1${path}`, {
    headers: {
      'apikey':        window.SUPABASE_ANON,
      'Authorization': `Bearer ${window.SUPABASE_ANON}`,
    }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/** Formatea número en pesos colombianos */
function fmt(n) {
  return '$' + parseInt(n).toLocaleString('es-CO');
}

/** ¿El producto fue creado hace menos de N días? */
function esNuevo(prod, newDays) {
  if (!prod.created_at) return false;
  return (Date.now() - new Date(prod.created_at).getTime()) < parseInt(newDays) * 86400000;
}

/** HTML del badge según tipo de producto */
function badgeHtml(prod, newDays) {
  if (prod.badge === 'rec') return '<span class="badge-rec">⭐ Recomendado</span>';
  if (prod.badge === 'new' || (prod.badge_new_auto && esNuevo(prod, newDays))) {
    return '<span class="badge-new">Nuevo</span>';
  }
  return '';
}
