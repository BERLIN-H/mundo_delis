/**
 * MUNDO DELIS · Ubicacion Page Logic
 * Archivo: js/ubicacion.js
 * Estado abierto/cerrado según hora Colombia (UTC-5)
 */

(function () {
  const now   = new Date();
  const utcH  = now.getUTCHours();
  const utcM  = now.getUTCMinutes();
  const totalMin = (utcH * 60 + utcM) - 5 * 60; // minutos desde medianoche en CO
  const coMin    = ((totalMin % 1440) + 1440) % 1440;
  const day      = (now.getUTCDay() + (totalMin < 0 ? -1 : 0) + 7) % 7; // 0=Dom, 1=Lun…

  let open = false;
  if (day >= 1 && day <= 5 && coMin >= 480 && coMin < 1200) open = true; // Lun-Vie 8-20h
  if ((day === 0 || day === 6) && coMin >= 540 && coMin < 1080) open = true; // Sab-Dom 9-18h

  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-txt');
  dot.className = 'status-dot ' + (open ? 'dot-open' : 'dot-closed');
  txt.textContent = open ? 'Abierto ahora' : 'Cerrado en este momento';
})();
