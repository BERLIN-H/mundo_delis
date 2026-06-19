# Guía: Configurar URLs en Supabase y Google Console

## ¿Por qué falla el login con Google?

Cuando haces login con Google, Supabase redirige al usuario de vuelta
a una URL fija que tú registras. Si esa URL no coincide exactamente
con la registrada, Google/Supabase bloquea el callback.

Tu dominio en Netlify: https://mundo-delis.netlify.app
(Si tienes dominio propio, reemplaza en todos los pasos)

---

## PASO 1 — Supabase Dashboard

URL: https://supabase.com/dashboard/project/sylkotirzlhrwybqelis/auth/url-configuration

### Site URL
```
https://mundo-delis.netlify.app
```

### Redirect URLs (agrega TODAS estas)
```
https://mundo-delis.netlify.app/admin
https://mundo-delis.netlify.app/login
https://mundo-delis.netlify.app/**
http://localhost:3000/admin
http://localhost:8888/admin
```

Cómo llegar:
  Supabase Dashboard → tu proyecto → Authentication → URL Configuration

---

## PASO 2 — Google Cloud Console

URL: https://console.cloud.google.com/apis/credentials

1. Abre el OAuth 2.0 Client ID que usas para Mundo Delis
2. En "Authorized JavaScript origins" agrega:
   ```
   https://mundo-delis.netlify.app
   https://sylkotirzlhrwybqelis.supabase.co
   ```
3. En "Authorized redirect URIs" agrega:
   ```
   https://sylkotirzlhrwybqelis.supabase.co/auth/v1/callback
   ```
   ⚠️  Este es el callback de SUPABASE, no de Netlify.
       Supabase maneja el callback de Google internamente y luego
       redirige al usuario a la URL que pusiste en el Paso 1.

---

## PASO 3 — config.js (ya corregido en el ZIP)

```js
window.SITE_URL = 'https://mundo-delis.netlify.app';
//                 ↑ Sin barra al final
```

---

## Flujo completo del login con Google

1. Usuario hace clic en "Continuar con Google"
2. Supabase redirige a Google (usando las credenciales OAuth)
3. Google autentica y redirige a:
   → https://sylkotirzlhrwybqelis.supabase.co/auth/v1/callback
4. Supabase procesa el token y redirige al usuario a:
   → https://mundo-delis.netlify.app/admin  (el redirectTo que pusiste)
5. admin.html recoge los tokens del hash de la URL y establece la sesión

---

## Verificación rápida

Abre: https://mundo-delis.netlify.app/admin

✅ Debe mostrar la pantalla de "Verificando acceso..."
✅ Si no hay sesión, redirige a /login
✅ Login con email → va a /admin
✅ Login con Google → va a /admin

Si sigue dando 404 en /admin, verifica en Netlify:
  Site settings → Deploys → que el archivo _redirects esté en el deploy
