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

// ══════════════════════════════════════════════
//  HORARIO DE ATENCIÓN (compartido entre páginas)
// ══════════════════════════════════════════════

/** Trae y parsea el horario semanal guardado en ajustes.clave = 'horario_semana'.
 *  Devuelve un objeto { "0": {abierto, apertura, cierre}, ..., "6": {...} } o null si falla. */
async function cargarHorarioSemana() {
  try {
    const rows = await sbGet('/ajustes?clave=eq.horario_semana&select=valor');
    if (!rows.length) return null;
    return JSON.parse(rows[0].valor);
  } catch (e) {
    console.error('Error cargando horario:', e);
    return null;
  }
}

/** Trae y parsea la lista de métodos de pago guardada en ajustes.clave = 'metodos_pago'. */
async function cargarMetodosPago() {
  try {
    const rows = await sbGet('/ajustes?clave=eq.metodos_pago&select=valor');
    if (!rows.length) return [];
    return JSON.parse(rows[0].valor);
  } catch (e) {
    console.error('Error cargando métodos de pago:', e);
    return [];
  }
}

/** Calcula si el negocio está abierto AHORA, según hora de Colombia (UTC-5, sin horario de verano).
 *  Recibe el objeto de horario ya parseado (de cargarHorarioSemana).
 *  Devuelve { abierto: bool, dia: {abierto, apertura, cierre} } */
function calcularEstadoHorario(horario) {
  if (!horario) return { abierto: false, dia: null };

  const now      = new Date();
  const utcMin   = now.getUTCHours() * 60 + now.getUTCMinutes();
  let   coMinRaw = utcMin - 5 * 60; // Colombia = UTC-5
  let   diaIdx   = now.getUTCDay();

  if (coMinRaw < 0) {
    coMinRaw += 1440;
    diaIdx = (diaIdx + 6) % 7; // un día antes
  }

  const dia = horario[String(diaIdx)];
  if (!dia || !dia.abierto) return { abierto: false, dia };

  const [hA, mA] = dia.apertura.split(':').map(Number);
  const [hC, mC] = dia.cierre.split(':').map(Number);
  const minApertura = hA * 60 + mA;
  const minCierre    = hC * 60 + mC;

  const abierto = coMinRaw >= minApertura && coMinRaw < minCierre;
  return { abierto, dia };
}

/** Convierte "08:00" → "8:00am" para mostrar al cliente. */
function horaLegible(hhmm) {
  let [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')}${ampm}`;
}

const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];