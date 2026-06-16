// config.js
// ══════════════════════════════════════════════════════════════
//  Configuración pública del frontend de Mundo Delis.
//
//  ✅ SUPABASE_ANON es una key PÚBLICA por diseño de Supabase.
//     Cualquiera puede verla — la seguridad la hacen las
//     políticas RLS en la base de datos, no esta key.
//     Documentación oficial: https://supabase.com/docs/guides/api/api-keys
//
//  🚨 SUPABASE_SERVICE_KEY nunca va aquí.
//     Vive solo en las variables de entorno de Netlify
//     (netlify/functions/admin-api.js la lee desde process.env).
// ══════════════════════════════════════════════════════════════

window.SUPABASE_URL  = 'https://sylkotirzlhrwybqelis.supabase.co';
window.SUPABASE_ANON = 'TU_ANON_KEY_AQUI';
