const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY;  // solo en servidor
const SUPABASE_ANON    = process.env.SUPABASE_ANON_KEY;

const API = `${SUPABASE_URL}/rest/v1`;

// ── CORS headers ──────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ── Handler principal ─────────────────────────────────────────
exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, payload, token } = body;

  // ── 1. Verificar sesión de Supabase Auth ──────────────────
  if (!token) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Sin sesión' }) };
  }

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!userRes.ok) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Sesión inválida' }) };
    }
    const user = await userRes.json();

    // ── 2. Verificar rol ADMIN ────────────────────────────────
    // El rol se guarda en user_metadata al crear el usuario admin
    const rol = user.user_metadata?.rol || user.app_metadata?.rol;
    if (rol !== 'ADMIN') {
      return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Acceso denegado: no es ADMIN' }) };
    }
  } catch (e) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error verificando sesión' }) };
  }

  // ── 3. Ejecutar la acción con service key ─────────────────
  const svcHdrs = {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_SERVICE,
    'Authorization': `Bearer ${SUPABASE_SERVICE}`,
    'Prefer':        'return=representation',
  };

  try {
    let result;

    switch (action) {

      // ── PRODUCTOS ──────────────────────────────────────────
      case 'productos.insert': {
        const r = await fetch(`${API}/productos`, {
          method: 'POST', headers: svcHdrs, body: JSON.stringify(payload),
        });
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }
      case 'productos.update': {
        const { id, ...data } = payload;
        const r = await fetch(`${API}/productos?id=eq.${id}`, {
          method: 'PATCH', headers: svcHdrs, body: JSON.stringify(data),
        });
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }
      case 'productos.delete': {
        const r = await fetch(`${API}/productos?id=eq.${payload.id}`, {
          method: 'DELETE', headers: svcHdrs,
        });
        if (!r.ok) { const t = await r.text(); throw new Error(t); }
        result = { deleted: true };
        break;
      }

      // ── CATEGORIAS ─────────────────────────────────────────
      case 'categorias.insert': {
        const r = await fetch(`${API}/categorias`, {
          method: 'POST', headers: svcHdrs, body: JSON.stringify(payload),
        });
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }
      case 'categorias.update': {
        const { id, ...data } = payload;
        const r = await fetch(`${API}/categorias?id=eq.${id}`, {
          method: 'PATCH', headers: svcHdrs, body: JSON.stringify(data),
        });
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }
      case 'categorias.delete': {
        const r = await fetch(`${API}/categorias?id=eq.${payload.id}`, {
          method: 'DELETE', headers: svcHdrs,
        });
        if (!r.ok) { const t = await r.text(); throw new Error(t); }
        result = { deleted: true };
        break;
      }

      // ── AJUSTES ────────────────────────────────────────────
      case 'ajustes.update': {
        const { clave, valor } = payload;
        const r = await fetch(`${API}/ajustes?clave=eq.${clave}`, {
          method: 'PATCH', headers: svcHdrs, body: JSON.stringify({ valor }),
        });
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }

      // ── STORAGE: generar URL firmada para subir ────────────
      // El cliente sube la imagen directo a Storage con una URL
      // firmada de solo escritura, sin exponer la service key.
      case 'storage.signedUpload': {
        const { path } = payload;
        const r = await fetch(
          `${SUPABASE_URL}/storage/v1/object/upload/sign/imagenes/${path}`,
          {
            method: 'POST',
            headers: {
              'apikey':        SUPABASE_SERVICE,
              'Authorization': `Bearer ${SUPABASE_SERVICE}`,
              'Content-Type':  'application/json',
            },
          }
        );
        result = await r.json();
        if (!r.ok) throw new Error(JSON.stringify(result));
        break;
      }

      default:
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Acción desconocida: ${action}` }) };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: true, data: result }),
    };

  } catch (e) {
    console.error('[admin-api]', e.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
