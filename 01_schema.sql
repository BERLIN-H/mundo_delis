-- ══════════════════════════════════════════════════════════════
--  MUNDO DELIS · Supabase Schema
--  Proyecto: sylkotirzlhrwybqelis
--  Ejecuta este archivo en SQL Editor de Supabase
-- ══════════════════════════════════════════════════════════════

-- ── 1. EXTENSIONES ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 2. TABLA: categorias ────────────────────────────────────
create table if not exists public.categorias (
  id          text        primary key,            -- slug: 'galleteria', 'postres'…
  nombre      text        not null,
  icono       text        not null default 'ti-category',
  descripcion text        not null default '',
  orden       smallint    not null default 99,
  created_at  timestamptz not null default now()
);

-- ── 3. TABLA: productos ─────────────────────────────────────
create table if not exists public.productos (
  id           uuid        primary key default uuid_generate_v4(),
  categoria_id text        not null references public.categorias(id) on delete set null,
  nombre       text        not null,
  precio       integer     not null check (precio >= 0),   -- COP, sin decimales
  desc_corta   text        not null default '',
  desc_larga   text        not null default '',
  imagen_url   text        not null default '',
  badge        text        not null default ''             -- '', 'new', 'rec'
                           check (badge in ('', 'new', 'rec')),
  badge_new_auto boolean   not null default true,          -- si true, badge 'new' es automático por fecha
  visible      boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Trigger: actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- ── 4. TABLA: ajustes ───────────────────────────────────────
create table if not exists public.ajustes (
  clave  text primary key,
  valor  text not null
);

-- Valores por defecto
insert into public.ajustes (clave, valor) values
  ('new_days', '14'),
  ('admin_pwd_hash', 'mundodelis2026')   -- se reemplaza desde el panel
on conflict (clave) do nothing;

-- ── 5. STORAGE BUCKET ───────────────────────────────────────
-- Crear en Supabase Dashboard → Storage → New bucket
-- Nombre: "imagenes"  |  Public: true
-- O ejecuta:
insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true)
on conflict (id) do nothing;

-- ── 6. ROW LEVEL SECURITY ───────────────────────────────────

-- 6a. CATEGORIAS
alter table public.categorias enable row level security;

-- Lectura pública (menú público)
create policy "categorias_public_read"
  on public.categorias for select
  using (true);

-- Escritura solo con service_role (el admin usa la anon key + header especial, ver supabase.js)
-- En este esquema usamos anon key con header x-admin-key validado en app
create policy "categorias_admin_all"
  on public.categorias for all
  using (true)          -- el control lo hace el JS con la service key
  with check (true);

-- 6b. PRODUCTOS
alter table public.productos enable row level security;

create policy "productos_public_read"
  on public.productos for select
  using (visible = true);

create policy "productos_admin_all"
  on public.productos for all
  using (true)
  with check (true);

-- 6c. AJUSTES
alter table public.ajustes enable row level security;

create policy "ajustes_public_read"
  on public.ajustes for select
  using (true);

create policy "ajustes_admin_all"
  on public.ajustes for all
  using (true)
  with check (true);

-- 6d. STORAGE POLICIES
create policy "imagenes_public_read"
  on storage.objects for select
  using (bucket_id = 'imagenes');

create policy "imagenes_admin_upload"
  on storage.objects for insert
  with check (bucket_id = 'imagenes');

create policy "imagenes_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'imagenes');

-- ── 7. DATOS INICIALES · CATEGORÍAS ─────────────────────────
insert into public.categorias (id, nombre, icono, descripcion, orden) values
  ('galleteria', 'Galletería',           'ti-cookie',    'Galletas, merengues y delicias horneadas', 1),
  ('postres',    'Postres',              'ti-ice-cream', 'Porciones y postres de la casa',           2),
  ('panaderia',  'Panadería',            'ti-bread',     '',                                          3),
  ('bebidas',    'Bebidas y malteadas',  'ti-glass',     '',                                          4),
  ('waffles',    'Waffles',              'ti-waffle',    '',                                          5),
  ('vinos',      'Vinos & Cafés',        'ti-bottle',    '',                                          6),
  ('saludable',  'Línea saludable',      'ti-leaf',      '',                                          7),
  ('empaques',   'Empaques y tarjetas',  'ti-gift',      '',                                          8)
on conflict (id) do nothing;

-- ── 8. DATOS INICIALES · PRODUCTOS ──────────────────────────
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
-- GALLETERÍA
('galleteria', 'Merengues',               12000, 'x80gr. — crujientes por fuera, suaves por dentro',  'x80gr. Crujientes por fuera y suaves por dentro. Elaborados artesanalmente con clara de huevo y azúcar. Perfectos para acompañar un café.',                                                                     'img/galleteria/merengues.avif',            '',    true, now() - interval '60 days'),
('galleteria', 'Brownies',                 8000, 'Húmedos y con borde crocante',                       'Húmedos, con borde crocante y centro suave. Preparados con cacao de alta calidad. Una de las opciones más pedidas de la casa.',                                                                               'img/galleteria/brownies.avif',             'rec', true, now() - interval '60 days'),
('galleteria', 'Pavlovas',                10000, 'Base de merengue con frutas frescas',                 'Base de merengue horneado con frutas frescas de temporada y crema. Un postre ligero con textura única: crocante por fuera y suave por dentro.',                                                               'img/galleteria/pavlovas.avif',             '',    true, now() - interval '60 days'),
('galleteria', 'Alfajores',                3500, 'Clásico relleno de arequipe',                         'Galletas suaves de maicena rellenas de arequipe artesanal y cubiertas en azúcar glass. Un clásico latinoamericano hecho con amor.',                                                                          'img/galleteria/alfajores.avif',            '',    true, now() - interval '60 days'),
('galleteria', 'Galletas de mantequilla', 10000, 'Con punto de bocadillo — x13 galletas',               'Galletas de mantequilla con relleno de bocadillo. Unidad x13 galletas. Crujientes, dulces y con ese sabor que recuerda a la repostería casera.',                                                              'img/galleteria/galletas-mantequilla.avif', '',    true, now() - interval '60 days'),
('galleteria', 'New York cookies',         5000, 'Galletas de chips de chocolate',                       'Galletas estilo americano con chips de chocolate belga. Grandes, suaves en el centro y ligeramente crocantes en los bordes. Irresistibles.',                                                                  'img/galleteria/new-york-cookies.avif',     '',    true, now() - interval '60 days'),
-- POSTRES
('postres', 'Tarta de Queso',              22000, 'Cremoso cheesecake horneado al estilo artesanal',     'Cheesecake horneado al estilo artesanal, con base de galleta y relleno cremoso de queso. Textura suave y sabor equilibrado entre dulce y lácteo.',                                                           'img/postres/tarta-queso.avif',             '',    true, now() - interval '60 days'),
('postres', 'Crema con durazno',           20000, 'Crema de la casa con trozos de durazno natural',      'Crema de la casa preparada con ingredientes frescos, acompañada de trozos de durazno natural. Refrescante y ligera.',                                                                                        'img/postres/crema-durazno.avif',           'new', true, now() - interval '5 days'),
('postres', 'Tres Leches Tradicional',     20000, 'Bizcocho bañado en tres leches, suave y cremoso',     'Bizcocho esponjoso bañado en una mezcla de leche condensada, leche evaporada y crema de leche. El clásico que nunca falla.',                                                                                  'img/postres/tres-leches.avif',             '',    true, now() - interval '60 days'),
('postres', 'Arroz con Leche',             15000, 'Receta tradicional de la casa, con canela',            'Receta tradicional preparada con leche entera, canela y un toque especial de la casa. Cremoso y reconfortante.',                                                                                             'img/postres/arroz-leche.avif',             '',    true, now() - interval '60 days'),
('postres', 'Arequipe Fusión',             15000, 'Postre cremoso de arequipe artesanal',                 'Postre cremoso elaborado con arequipe artesanal colombiano. Suave, dulce y con una textura inigualable.',                                                                                                    'img/postres/arequipe-fusion.avif',         '',    true, now() - interval '60 days'),
('postres', 'Porción torta de zanahoria',  17000, 'Torta rústica con frutos secos',                       'Torta rústica de zanahoria con frutos secos. Húmeda, esponjosa y con ese sabor especiado que la hace única. ¡Recién llegada al menú!',                                                                       'img/postres/torta-zanahoria.avif',         'new', true, now() - interval '3 days'),
('postres', 'Brownie con helado',           20000, 'Brownie caliente con bola de helado premium',          'Brownie caliente recién salido del horno, acompañado de una bola de helado premium. La combinación perfecta de caliente y frío.',                                                                            'img/postres/brownie-helado.avif',          '',    true, now() - interval '60 days'),
('postres', 'Genovesa',                    20000, 'Bizcocho clásico esponjoso de la casa',                 'Bizcocho clásico esponjoso de la casa, con una miga suave y aireada. Ideal para quienes buscan algo ligero y delicado.',                                                                                     'img/postres/genovesa.avif',                '',    true, now() - interval '60 days'),
('postres', 'Napoleón',                    17000, 'Hojaldre en capas con crema pastelera',                 'Hojaldre en capas crujientes con crema pastelera suave entre cada lámina. Un postre elegante con mucha personalidad.',                                                                                       'img/postres/napoleon.avif',                '',    true, now() - interval '60 days'),
('postres', 'Cuatro Leches',               18000, 'Más cremoso que el tres leches, con leche condensada extra', 'Versión más cremosa del tres leches, con una capa adicional de leche condensada. Intenso, húmedo y delicioso.',                                                                                  'img/postres/cuatro-leches.avif',           '',    true, now() - interval '60 days'),
('postres', 'Pie de Limón',                18000, 'Base de galleta con crema de limón y merengue',         'Base de galleta crujiente, relleno de crema de limón suavemente ácida y cubierto de merengue dorado. Equilibrio perfecto.',                                                                                  'img/postres/pie-limon.avif',               '',    true, now() - interval '60 days'),
('postres', 'Flan de Caramelo',            18000, 'Suave flan bañado en caramelo dorado',                  'Flan suave y sedoso bañado en caramelo dorado. Preparado con la receta tradicional de la casa, sin complicaciones y lleno de sabor.',                                                                        'img/postres/flan-caramelo.avif',           '',    true, now() - interval '60 days'),
('postres', 'Porción de Torta Fría',       17000, 'Porción individual de nuestra torta fría de la casa',   'Porción individual de la torta fría de la casa. Capas de galleta, crema y sabor en cada bocado. No necesita horno.',                                                                                         'img/postres/torta-fria.avif',              '',    true, now() - interval '60 days'),
('postres', 'Torta amapola y yogurt',      15000, 'Toque floral con base de yogurt natural',               'Bizcocho con semillas de amapola y base de yogurt natural. Esponjoso, aromático y con un sabor suave y diferente.',                                                                                          'img/postres/torta-amapola.avif',           '',    true, now() - interval '60 days'),
('postres', 'Fresas con crema',            22000, 'Crema de la casa con trozos de fresa fresca',           'Crema de la casa preparada diariamente, acompañada de trozos de fresa fresca. Clásico y refrescante.',                                                                                                       'img/postres/fresas-crema.avif',            '',    true, now() - interval '60 days'),
('postres', 'Raspao MD',                   18000, 'El clásico raspao con toppings especiales de la casa',  'El clásico raspao colombiano con toppings especiales de Mundo Delis: sirope, leche condensada y frutas. Perfecto para el calor.',                                                                             'img/postres/raspao.avif',                  '',    true, now() - interval '60 days'),
('postres', 'Cremoso de Brownie',          15000, 'Postre cremoso en copa con trozos de brownie',           'Postre en copa con capas de crema suave y trozos de brownie. Dulce, cremoso y con la textura perfecta en cada cucharada.',                                                                                   'img/postres/cremoso-brownie.avif',         '',    true, now() - interval '60 days'),
('postres', 'Cheesecake de Maracuyá',      20000, 'Cheesecake cremoso con coulis de maracuyá',              'Cheesecake cremoso con coulis de maracuyá sobre base de galleta. El contraste entre lo dulce y lo ácido lo hace irresistible.',                                                                               'img/postres/cheesecake-maracuya.avif',     'new', true, now() - interval '4 days'),
('postres', 'Cheesecake de Oreo al Horno', 22000, 'Cheesecake horneado con base y cobertura de galleta Oreo', 'Cheesecake horneado con base y cobertura de galleta Oreo. Cremoso, intenso y con ese sabor a chocolate que no falla.',                                                                              'img/postres/cheesecake-oreo.avif',         'new', true, now() - interval '4 days'),
('postres', 'Tres Leches con Brownie',     15000, 'Fusión del clásico tres leches con trozos de brownie',   'Fusión del clásico tres leches con trozos de brownie. Húmedo, esponjoso y con el toque de chocolate que lo lleva al siguiente nivel.',                                                                       'img/postres/tres-leches-brownie.avif',     'new', true, now() - interval '4 days');
