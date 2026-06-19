# Mundo Delis · Estructura del Proyecto

## Árbol de carpetas

```
mundo_delis/
├── index.html              ← Página de inicio (home)
├── config.js               ← Credenciales Supabase (URL + anon key)
├── netlify.toml            ← Config Netlify + redirects
├── 01_schema.sql           ← Schema de la base de datos Supabase
│
├── pages/                  ← Todas las páginas HTML
│   ├── menu.html           ← Grid de categorías
│   ├── productos.html      ← Lista de productos por categoría
│   ├── detalle.html        ← Detalle de un producto
│   ├── domicilios.html     ← Formulario de pedido WhatsApp
│   ├── ubicacion.html      ← Mapa y horarios
│   ├── login.html          ← Login / registro admin
│   └── admin.html          ← Panel de administración
│
├── css/                    ← Estilos separados por módulo
│   ├── frontend.css        ← Estilos del sitio público (home, menú, productos, etc.)
│   ├── admin.css           ← Estilos del panel admin
│   └── login.css           ← Estilos de la pantalla de login
│
├── js/                     ← Lógica JavaScript separada por página
│   ├── utils.js            ← Funciones compartidas (sbGet, fmt, badges)
│   ├── menu.js             ← Lógica del menú de categorías
│   ├── productos.js        ← Lógica de lista de productos
│   ├── detalle.js          ← Lógica del detalle de producto
│   ├── domicilios.js       ← Catálogo local + lógica de pedido WhatsApp
│   ├── ubicacion.js        ← Estado abierto/cerrado por hora Colombia
│   ├── login.js            ← Auth Supabase (email + Google OAuth)
│   └── admin.js            ← Toda la lógica del panel admin
│
├── netlify/
│   └── functions/
│       └── admin-api.js    ← Netlify Function (backend serverless)
│
├── img/
│   ├── logo.avif
│   ├── galleteria/
│   └── postres/
│
└── qr/
    ├── MundoDelisQR.png
    └── generar_QR.py
```

## Rutas amigables (Netlify redirects)

| URL amigable     | Archivo real               |
|------------------|----------------------------|
| `/`              | `index.html`               |
| `/menu`          | `pages/menu.html`          |
| `/productos`     | `pages/productos.html`     |
| `/detalle`       | `pages/detalle.html`       |
| `/domicilios`    | `pages/domicilios.html`    |
| `/ubicacion`     | `pages/ubicacion.html`     |
| `/login`         | `pages/login.html`         |
| `/admin`         | `pages/admin.html`         |
| `/api/*`         | Netlify Function           |

## Variables de entorno (Netlify Dashboard)

```
SUPABASE_URL=https://sylkotirzlhrwybqelis.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...   ← solo en Functions, nunca en frontend
ADMIN_ACTIVATION_CODE=...
```
