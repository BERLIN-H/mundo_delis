-- ══════════════════════════════════════════════════════════════
--  MUNDO DELIS · Esquema de Opciones de Producto
--  Para productos como Tarjetas, Sodas Frutales, Malteadas, etc.
--  que requieren que el cliente elija una variante (sabor, tipo…)
--  Ejecuta este archivo en SQL Editor de Supabase DESPUÉS de 01_schema.sql
-- ══════════════════════════════════════════════════════════════

-- ── TABLA: producto_opciones (grupos de opciones por producto) ──
-- Ej: "Escoge sabor de torta", "Sabor de helado", "Sabor sodas"
create table if not exists public.producto_opciones (
  id            uuid        primary key default uuid_generate_v4(),
  producto_id   uuid        not null references public.productos(id) on delete cascade,
  titulo        text        not null,                 -- "Escoge sabor", "Sabor de helado"...
  obligatorio   boolean     not null default true,     -- si el cliente debe elegir 1 valor sí o sí
  orden         smallint    not null default 1,
  created_at    timestamptz not null default now()
);

-- ── TABLA: producto_opciones_valores (valores dentro de cada grupo) ──
-- Ej: "Fresas con Crema", "Cuatro Leches", "Cremoso de Brownie"
create table if not exists public.producto_opciones_valores (
  id           uuid        primary key default uuid_generate_v4(),
  opcion_id    uuid        not null references public.producto_opciones(id) on delete cascade,
  etiqueta     text        not null,                  -- texto visible: "Fresa-limón"
  precio_extra integer     not null default 0,        -- recargo opcional sobre el precio base
  orden        smallint    not null default 1,
  created_at   timestamptz not null default now()
);

-- ── RLS ──
alter table public.producto_opciones enable row level security;
alter table public.producto_opciones_valores enable row level security;

create policy "producto_opciones_public_read"
  on public.producto_opciones for select
  using (true);

create policy "producto_opciones_admin_all"
  on public.producto_opciones for all
  using (true)
  with check (true);

create policy "producto_opciones_valores_public_read"
  on public.producto_opciones_valores for select
  using (true);

create policy "producto_opciones_valores_admin_all"
  on public.producto_opciones_valores for all
  using (true)
  with check (true);

-- ── ÍNDICES ──
create index if not exists idx_producto_opciones_producto
  on public.producto_opciones(producto_id);

create index if not exists idx_producto_opciones_valores_opcion
  on public.producto_opciones_valores(opcion_id);