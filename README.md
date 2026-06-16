# 🍰 Mundo Delis — Conexión a Supabase
## Guía de activación paso a paso

---

## 1. Ejecutar el SQL en Supabase

1. Ve a **https://supabase.com/dashboard/project/sylkotirzlhrwybqelis**
2. Sidebar → **SQL Editor** → **New query**
3. Pega el contenido completo de `01_schema.sql`
4. Clic en **Run** (▶)

Esto crea:
- Tabla `categorias` con las 8 categorías del menú
- Tabla `productos` con los 25 productos originales
- Tabla `ajustes` (contraseña del panel, días de badge "Nuevo")
- Bucket de Storage `imagenes` (público)
- Políticas RLS de seguridad

---

## 2. Crear el bucket de Storage

Si el SQL no creó el bucket automáticamente:

1. Dashboard → **Storage** → **New bucket**
2. Nombre: `imagenes`
3. Activar **Public bucket** ✅
4. Clic en **Create bucket**

---

## 3. Obtener las API Keys

1. Dashboard → **Project Settings** → **API**
2. Copia:
   - **`anon` / `public`** → para los archivos públicos (menu, productos, detalle)
   - **`service_role` / `secret`** → solo para `admin.html`

---

## 4. Pegar las keys en los archivos HTML

Busca `TU_ANON_KEY_AQUI` y `TU_SERVICE_KEY_AQUI` y reemplázalos:

### En `menu.html`, `productos.html`, `detalle.html`:
```javascript
const SUPABASE_ANON = 'eyJhbGciOiJIUz...';  // tu anon key
```

### En `admin.html` (DOS valores):
```javascript
const SUPABASE_ANON    = 'eyJhbGciOiJIUz...';  // anon key
const SUPABASE_SERVICE = 'eyJhbGciOiJIUz...';  // service_role key  ← PRIVADA
```

---

## 5. Reemplazar archivos en tu repositorio

Sube estos archivos a tu repo `BERLIN-H/mundo_delis`:

| Archivo nuevo         | Reemplaza a        |
|-----------------------|--------------------|
| `menu.html`           | `menu.html`        |
| `productos.html`      | `productos.html`   |
| `detalle.html`        | `detalle.html`     |
| `admin.html`          | (nuevo archivo)    |

---

## 6. Cambios en `detalle.html` — URL de producto

El link a detalle ahora usa el UUID de Supabase en vez del slug hardcodeado.
El formato cambió de:
```
detalle.html?cat=postres&id=p1
```
a:
```
detalle.html?id=550e8400-e29b-41d4-a716-446655440000
```

`productos.html` ya genera los links correctamente.

---

## 7. Imágenes de los productos existentes

Los productos originales usan rutas locales (`img/postres/tarta-queso.avif`).
Tienes dos opciones:

### Opción A — Dejar las rutas locales (más fácil)
Las imágenes locales siguen funcionando siempre que estén en el repo. No hace falta moverlas.

### Opción B — Subir a Supabase Storage (recomendado a futuro)
Desde `admin.html`, edita cada producto y usa el botón de subir imagen.
La nueva URL quedará guardada en Supabase automáticamente.

---

## 8. ⚠️ Proteger admin.html

La `service_role` key está dentro de `admin.html`.
Si el sitio es público en GitHub Pages, cualquiera puede verla inspeccionando el código.

**Opciones para protegerlo:**
- Renombrar `admin.html` a algo no obvio, ej: `gestion-md-2026.html`
- En Supabase → Authentication → habilitar email auth y proteger con login real
- Usar Netlify/Vercel en vez de GitHub Pages y agregar restricción de IP

---

## Estructura de tablas

### `categorias`
| columna      | tipo    | descripción                      |
|--------------|---------|----------------------------------|
| id           | text PK | slug: galleteria, postres…       |
| nombre       | text    | Galletería, Postres…             |
| icono        | text    | clase Tabler: ti-cookie          |
| descripcion  | text    | subtítulo de la categoría        |
| orden        | int     | posición en el menú              |

### `productos`
| columna        | tipo    | descripción                          |
|----------------|---------|--------------------------------------|
| id             | uuid PK | auto-generado                        |
| categoria_id   | text FK | ref a categorias.id                  |
| nombre         | text    | nombre del producto                  |
| precio         | int     | precio en COP sin decimales          |
| desc_corta     | text    | resumen en 1 línea (lista)           |
| desc_larga     | text    | descripción completa (detalle)       |
| imagen_url     | text    | URL local o de Storage               |
| badge          | text    | '', 'new', 'rec'                     |
| badge_new_auto | bool    | si true, badge automático por fecha  |
| visible        | bool    | false = oculto sin eliminar          |
| created_at     | tstz    | fecha de creación (badge automático) |

### `ajustes`
| clave            | valor           |
|------------------|-----------------|
| new_days         | 14              |
| admin_pwd_hash   | mundodelis2026  |

---

## Contraseña inicial del panel

```
mundodelis2026
```

Cámbiala desde **admin.html → Ajustes → Seguridad** después del primer login.
