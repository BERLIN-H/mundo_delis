/**
 * MUNDO DELIS · Ubicacion Page Logic
 * Archivo: js/ubicacion.js
 * Estado abierto/cerrado y tabla de horario, según configuración del Admin.
 */

(async function () {
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-txt');
  const tabla = document.getElementById('schedule-table');

  const horario = await cargarHorarioSemana();

  if (!horario) {
    txt.textContent = 'Horario no disponible';
    tabla.innerHTML = '';
    return;
  }

  const { abierto } = calcularEstadoHorario(horario);
  dot.className = 'status-dot ' + (abierto ? 'dot-open' : 'dot-closed');
  txt.textContent = abierto ? 'Abierto ahora' : 'Cerrado en este momento';

  tabla.innerHTML = agruparHorario(horario);
})();

// ── Agrupa días consecutivos con el mismo horario, ej: "Lunes – Viernes: 8:00am – 8:00pm" ──
function agruparHorario(horario) {
  // Reordena empezando en Lunes (1) para que se vea natural: Lun..Dom
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const dias  = orden.map(i => ({ idx: i, ...horario[String(i)] }));

  const grupos = [];
  let actual = null;

  dias.forEach(d => {
    const key = d.abierto ? `${d.apertura}-${d.cierre}` : 'cerrado';
    if (actual && actual.key === key) {
      actual.dias.push(d.idx);
    } else {
      actual = { key, dias: [d.idx], abierto: d.abierto, apertura: d.apertura, cierre: d.cierre };
      grupos.push(actual);
    }
  });

  return grupos.map(g => {
    const nombres = g.dias.map(i => NOMBRES_DIA[i]);
    const etiqueta = nombres.length > 1
      ? `${nombres[0]} – ${nombres[nombres.length - 1]}`
      : nombres[0];
    const horarioTxt = g.abierto
      ? `${horaLegible(g.apertura)} – ${horaLegible(g.cierre)}`
      : 'Cerrado';
    return `<div class="sched-row"><span>${etiqueta}</span><span>${horarioTxt}</span></div>`;
  }).join('');
}