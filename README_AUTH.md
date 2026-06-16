# 🔐 Mundo Delis · Autenticación con Supabase + Netlify
## Guía de activación paso a paso

---

## Qué hace este sistema

```
Visitante abre /admin.html
       ↓
Supabase Auth verifica si hay sesión activa
       ↓ No hay sesión  →  redirige a /login.html
       ↓ Hay sesión pero rol ≠ ADMIN  →  redirige a /login.html
       ↓ Hay sesión + rol = ADMIN
Panel admin carga
       ↓
Cualquier escritura (crear/editar/eliminar)
       ↓
POST /api/admin-api  (Netlify Function serverless)
       ↓  verifica token JWT de sesión
       ↓  verifica rol ADMIN en el token
       ↓  usa SERVICE_KEY del servidor (nunca llega al navegador)
Supabase ejecuta la operación
```

**La service_role key NUNCA aparece en el código del navegador.**

---

## PASO 1 — Habilitar Google OAuth en Supabase

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto o usar uno existente
3. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Nombre: `Mundo Delis Admin`
   - Authorized redirect URIs — agregar:
     ```
     https://sylkotirzlhrwybqelis.supabase.co/auth/v1/callback
     ```
4. Copiar el **Client ID** y **Client Secret**

5. En Supabase → **Authentication → Providers → Google**:
   - Enable Google provider: ✅
   - Client ID: (pegar el de Google)
   - Client Secret: (pegar el de Google)
   - Guardar

---

## PASO 2 — Configurar Supabase Auth

En Supabase → **Authentication → Settings**:

### URL Configuration
```
Site URL:             https://tu-sitio.netlify.app
Redirect URLs:        https://tu-sitio.netlify.app/admin.html
                      http://localhost:3000/admin.html  (para desarrollo local)
```

### Email Auth
- Enable email confirmations: **desactivado** (opcional, más simple para el admin)
- Enable email signup: ✅

---

## PASO 3 — Actualizar RLS para que el admin vea productos ocultos

Ejecuta este SQL en Supabase → SQL Editor:

```sql
-- Permitir que usuarios autenticados con rol ADMIN vean TODO (incluyendo ocultos)
DROP POLICY IF EXISTS "productos_admin_all" ON public.productos;

CREATE POLICY "productos_admin_read_all"
  ON public.productos FOR SELECT
  USING (
    visible = true
    OR
    (auth.role() = 'authenticated' AND (auth.jwt()->'user_metadata'->>'rol') = 'ADMIN')
  );

CREATE POLICY "productos_admin_write"
  ON public.productos FOR ALL
  USING (
    auth.role() = 'authenticated' AND (auth.jwt()->'user_metadata'->>'rol') = 'ADMIN'
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND (auth.jwt()->'user_metadata'->>'rol') = 'ADMIN'
  );
```

---

## PASO 4 — Subir a Netlify

### 4a. Crear el sitio en Netlify
1. Ir a [app.netlify.com](https://app.netlify.com)
2. **Add new site → Import an existing project → GitHub**
3. Seleccionar el repo `BERLIN-H/mundo_delis`
4. Build settings:
   - Build command: (vacío, no tiene build)
   - Publish directory: `.`
   - La función serverless vive en `netlify/functions/admin-api.js` (Netlify la detecta sola gracias a `netlify.toml`)
5. Deploy

### 4b. Agregar variables de entorno
En Netlify → Site → **Environment variables → Add variable**:

| Variable                 | Valor                                               |
|---------------------------|-----------------------------------------------------|
| `SUPABASE_URL`             | `https://sylkotirzlhrwybqelis.supabase.co`          |
| `SUPABASE_ANON_KEY`        | tu `anon` key de Supabase                           |
| `SUPABASE_SERVICE_KEY`     | tu `service_role` key de Supabase ← **PRIVADA**     |
| `ADMIN_ACTIVATION_CODE`    | tu código secreto de activación ← **PRIVADA, ya NO va en el HTML** |

Después de agregar las variables → **Trigger deploy** para que surtan efecto.

---

## PASO 5 — Actualizar redirect URI de Google

Una vez que Netlify te dé el dominio (ej: `mundodelis.netlify.app`), vuelve a Google Console y agrega:
```
https://mundodelis.netlify.app/admin.html
```
en los Authorized redirect URIs.

Y en Supabase → Authentication → Settings → Redirect URLs:
```
https://mundodelis.netlify.app/admin.html
```

---

## PASO 6 — Crear tu cuenta admin

1. Abre `https://tu-sitio.netlify.app/login.html`
2. Clic en pestaña **"Registrarme"**
3. Completa el formulario:
   - Nombre: tu nombre
   - Correo: tu email
   - Contraseña: mínimo 8 caracteres
   - Código de activación: el mismo valor que pusiste en `ADMIN_ACTIVATION_CODE` en Netlify
4. Confirma el correo si Supabase lo pide (si tu proyecto exige confirmación, primero confirma e inicia sesión, y luego vuelve a intentar el registro con el código para que el servidor te promueva)
5. El servidor valida el código y te asigna `rol: ADMIN` en `app_metadata` — nunca en `user_metadata`, porque ese campo lo puede editar el propio usuario desde el navegador.

> El código de activación ya NO está escrito en ningún archivo del repo. Vive únicamente como variable de entorno en Netlify (`ADMIN_ACTIVATION_CODE`), así que no aparece en el código fuente de la página.

---

## PASO 7 — Login con Google (opcional)

Si el correo con el que iniciaste sesión en Google **no es el mismo** que registraste con email, el sistema te rechazará (rol no es ADMIN).

Para vincular tu cuenta Google: en Supabase → **Authentication → Users**, busca tu usuario y verifica su `app_metadata` (no `user_metadata`).

Si usas Google como primer método:
1. Click en "Continuar con Google"
2. Supabase crea el usuario automáticamente **sin** el rol ADMIN
3. Como la consola de Supabase Studio normalmente solo deja editar `user_metadata` desde la interfaz, para asignar `app_metadata.rol = ADMIN` corre esto en **Supabase → SQL Editor**:
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"rol":"ADMIN"}'::jsonb
   where email = 'tu_correo@gmail.com';
   ```
4. Cierra sesión y vuelve a iniciar sesión (o simplemente recarga `/admin.html` — como ahora la verificación usa `getUser()`, no necesitas volver a loguearte; basta con recargar la página para que traiga el rol actualizado del servidor).

---

## Archivos que subir al repo

| Archivo                          | Acción              |
|-----------------------------------|---------------------|
| `admin.html`                      | Reemplazar          |
| `login.html`                      | Reemplazar          |
| `netlify.toml`                    | Reemplazar          |
| `netlify/functions/admin-api.js`  | Reemplazar (ruta correcta, antes estaba en la raíz) |

---

## Desarrollo local con Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# En la raíz del proyecto
netlify dev
# Abre http://localhost:8888
```

Crea un archivo `.env` (en .gitignore) con:
```
SUPABASE_URL=https://sylkotirzlhrwybqelis.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
```

---

## Preguntas frecuentes

**¿Qué pasa si alguien encuentra la URL /admin.html?**
Sin una sesión válida con rol ADMIN, la página los redirige a /login.html automáticamente.

**¿La service_role key puede filtrarse?**
No. Vive solo en las variables de entorno de Netlify. El navegador nunca la recibe.

**¿Puedo tener múltiples admins?**
Sí. Cada uno se registra con el código de activación y queda con rol ADMIN.

**¿Qué pasa si cambio el código de activación?**
Las cuentas ya creadas siguen funcionando. Solo afecta a nuevos registros. Para cambiarlo, edita la variable `ADMIN_ACTIVATION_CODE` en Netlify (no hace falta tocar código).

**¿Por qué el rol se guarda en `app_metadata` y no en `user_metadata`?**
`user_metadata` lo puede modificar el propio usuario desde el navegador (con `supabase.auth.updateUser()`), así que cualquiera podría auto-asignarse el rol ADMIN. `app_metadata` solo se puede escribir desde el servidor con la `service_role` key, por eso es el único lugar confiable para guardar permisos.

**¿Por qué `admin.html` usa `getUser()` en vez de `getSession()`?**
`getSession()` solo lee la sesión guardada en el navegador (localStorage) sin confirmarla con Supabase; si editas el rol de un usuario después de que inició sesión, `getSession()` seguirá mostrando los datos viejos. `getUser()` sí consulta al servidor y siempre trae el estado actual — por eso es la forma correcta de decidir si alguien entra o no al panel.
