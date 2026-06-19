-- ══════════════════════════════════════════════════════════════
--  MUNDO DELIS · Seed de productos faltantes
--  Panadería, Bebidas y malteadas, Waffles, Vinos & Cafés,
--  Línea saludable, Empaques y tarjetas
--  Ejecuta DESPUÉS de 01_schema.sql y 02_opciones_schema.sql
-- ══════════════════════════════════════════════════════════════

-- ── PANADERÍA ──
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('panaderia', 'Salad Croissant',                  25000, 'Croissant + jamón, queso, verduras y salsa de la casa',  'Croissant relleno de jamón, queso, verduras frescas y salsa de la casa. Una opción salada perfecta para el almuerzo o la media tarde.', 'img/panaderia/salad-croissant.avif',  '',    true, now() - interval '60 days'),
('panaderia', 'Crookie',                          20000, 'Fusión de croissant y galleta de chocolate',              'Fusión entre croissant y galleta de chocolate: hojaldrado por fuera, relleno de masa de cookie por dentro. Recién llegado al menú.',  'img/panaderia/crookie.avif',          'new', true, now() - interval '5 days'),
('panaderia', 'Paliquesos',                        8000, '⭐ Recomendado — pan relleno de queso',                    'Pan suave relleno de queso fundido, horneado al punto justo. Uno de los favoritos recomendados de la casa.',                          'img/panaderia/paliquesos.avif',       'rec', true, now() - interval '60 days'),
('panaderia', 'Rollos de jamón',                    8000, 'Pan enrollado relleno de jamón',                          'Pan suave enrollado y relleno de jamón. Ideal para acompañar el café de la tarde.',                                                    'img/panaderia/rollos-jamon.avif',     '',    true, now() - interval '60 days'),
('panaderia', 'Croissant de almendras',            20000, 'Croissant relleno y cubierto de almendras',               'Croissant clásico relleno de crema y cubierto con almendras laminadas. Crujiente por fuera, suave por dentro.',                       'img/panaderia/croissant-almendras.avif', 'new', true, now() - interval '5 days'),
('panaderia', 'Croissant de pollo en salsa blanca', 27000, 'Croissant relleno de pollo en salsa blanca',              'Croissant horneado relleno de pollo desmechado bañado en salsa blanca casera. Una opción salada abundante y deliciosa.',               'img/panaderia/croissant-pollo.avif',  '',    true, now() - interval '60 days');

-- ── BEBIDAS Y MALTEADAS ──
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('bebidas', 'Soda Hatsu',            17000, 'Soda artesanal de la casa',                          'Soda artesanal preparada con frutas frescas y un toque burbujeante. Refrescante y diferente.',                              'img/bebidas/soda-hatsu.avif',            '',    true, now() - interval '60 days'),
('bebidas', 'JP Chenet Rosé 250ml',  25000, 'Copa de vino rosado JP Chenet, 250ml',               'Copa individual de vino rosado JP Chenet, 250ml. Suave, afrutado y perfecto para acompañar un postre.',                     'img/bebidas/jp-chenet-rose.avif',        '',    true, now() - interval '60 days'),
('bebidas', 'Coca Cola 250ml',        5000, 'Gaseosa Coca Cola, 250ml',                           'Gaseosa Coca Cola personal, 250ml.',                                                                                          'img/bebidas/coca-cola.avif',             '',    true, now() - interval '60 days'),
('bebidas', 'Coca Cola Zero 250ml',   5000, 'Gaseosa Coca Cola Zero, 250ml',                      'Gaseosa Coca Cola Zero personal, 250ml. Sin azúcar.',                                                                        'img/bebidas/coca-cola-zero.avif',        '',    true, now() - interval '60 days'),
('bebidas', 'Agua 310ml',             4000, 'Agua embotellada, 310ml',                            'Agua embotellada personal, 310ml.',                                                                                          'img/bebidas/agua.avif',                  '',    true, now() - interval '60 days'),
('bebidas', 'Soda Bretaña 300ml',     8000, 'Soda Bretaña, 300ml',                                 'Soda Bretaña personal, 300ml.',                                                                                              'img/bebidas/soda-bretana.avif',          '',    true, now() - interval '60 days'),
('bebidas', 'Sodas Frutales MD',     15000, '⭐ Recomendado — soda refrescante, escoge tu sabor',   'Sodas refrescantes de la casa. Escoge entre Fresa-limón, Maracupiña o Frutos Amarillos.',                                    'img/bebidas/sodas-frutales.avif',        'rec', true, now() - interval '60 days'),
('bebidas', 'Jugo de Fresa',         12000, 'Jugo natural de fresa',                               'Jugo natural de fresa, preparado fresco al momento. Sin conservantes añadidos.',                                             'img/bebidas/jugo-fresa.avif',            '',    true, now() - interval '60 days'),
('bebidas', 'Malteada de Vainilla',  16000, 'Malteada cremosa de vainilla',                       'Malteada cremosa de vainilla, servida con crema batida. Un clásico que nunca falla.',                                       'img/bebidas/malteada-vainilla.avif',     '',    true, now() - interval '60 days'),
('bebidas', 'Malteada ChocoBrownie', 16000, 'Malteada de chocolate con trozos de brownie',         'Malteada de chocolate con trozos de brownie mezclados. Intensa, cremosa y muy golosa.',                                     'img/bebidas/malteada-chocobrownie.avif', '',    true, now() - interval '60 days');

-- ── WAFFLES ──
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('waffles', 'Waffle Frutos Rojos',     25000, '⭐ Recomendado — waffle con frutos rojos y helado', 'Waffle recién hecho cubierto con frutos rojos frescos y una bola de helado. Uno de los favoritos de la casa.',           'img/waffles/frutos-rojos.avif',    'rec', true, now() - interval '60 days'),
('waffles', 'Waffle Arequipe Clásico', 25000, 'Waffle bañado en arequipe artesanal',               'Waffle clásico bañado en arequipe artesanal colombiano. Simple, dulce y delicioso.',                                      'img/waffles/arequipe-clasico.avif', '',    true, now() - interval '60 days'),
('waffles', 'Waffle Nutella',          25000, 'Waffle cubierto con Nutella',                       'Waffle recién hecho cubierto generosamente con Nutella. Para los amantes del chocolate.',                                 'img/waffles/nutella.avif',          '',    true, now() - interval '60 days');

-- ── LÍNEA SALUDABLE ──
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('saludable', 'Bowl Frutal MD',                            20000, 'Frutas frescas de temporada con granola y yogurt', 'Bowl de frutas frescas de temporada acompañado de granola crocante y yogurt natural. Ligero, fresco y nutritivo.',           'img/waffles/bowl-frutal.avif',   '',    true, now() - interval '60 days'),
('saludable', 'Waffle de yuca',                             25000, 'Base de yuca, opción sin gluten',                  'Waffle hecho con base de yuca, una opción sin gluten igual de crocante y deliciosa que el waffle tradicional.',              'img/waffles/waffle-yuca.avif',   'new', true, now() - interval '5 days'),
('saludable', 'Sándwich de yuca pollo en salsa blanca',     27000, 'Base de yuca con pollo en salsa blanca',          'Sándwich con base de yuca (sin gluten), relleno de pollo desmechado en salsa blanca casera. Abundante y saludable.',         'img/waffles/sandwich-yuca.avif', 'new', true, now() - interval '5 days');

-- ── VINOS & CAFÉS ──
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('vinos', 'Capuccino',          8000, 'Café espresso con leche vaporizada',                'Café espresso con leche vaporizada y espuma cremosa. Recién llegado al menú.',                                    'img/vinos-cafe/capuccino.avif',     'new', true, now() - interval '5 days'),
('vinos', 'Café',                5000, 'Café negro de la casa',                             'Café negro preparado al momento. Simple y reconfortante.',                                                        'img/vinos-cafe/cafe.avif',          '',    true, now() - interval '60 days'),
('vinos', 'Tinto de verano',    30000, 'Coctel refrescante de vino tinto con cítricos',     'Coctel refrescante a base de vino tinto, gaseosa y rodajas de cítricos. Ideal para compartir en una tarde calurosa.', 'img/vinos-cafe/tinto-verano.avif',  '',    true, now() - interval '60 days'),
('vinos', 'Sangría MD',         35000, 'Sangría de la casa con frutas frescas',             'Sangría preparada con vino, frutas frescas de temporada y un toque especial de la casa.',                          'img/vinos-cafe/sangria-md.avif',    '',    true, now() - interval '60 days'),
('vinos', 'Margarita Fresa',    30000, 'Margarita de fresa, fresca y frutal',               'Margarita preparada con fresa natural. Fresca, frutal y perfecta para acompañar un postre.',                       'img/vinos-cafe/margarita-fresa.avif','',    true, now() - interval '60 days'),
('vinos', 'Aperol Spritz',      33000, 'Clásico coctel italiano con Aperol y prosecco',     'El clásico coctel italiano: Aperol, prosecco y un toque de soda. Refrescante y elegante.',                          'img/vinos-cafe/aperol-spritz.avif', '',    true, now() - interval '60 days'),
('vinos', 'Pop Champagne Rose', 35000, 'Copa de champagne rosado espumoso',                 'Copa de champagne rosado, fino y espumoso. Perfecto para celebrar cualquier ocasión especial.',                    'img/vinos-cafe/pop-champagne.avif', '',    true, now() - interval '60 days'),
('vinos', 'Mojito',             28000, 'Clásico mojito con hierbabuena fresca',             'El clásico mojito: ron, hierbabuena fresca, limón y soda. Refrescante de principio a fin.',                        'img/vinos-cafe/mojito.avif',        '',    true, now() - interval '60 days');

-- ══════════════════════════════════════════════════════════════
--  EMPAQUES Y TARJETAS
-- ══════════════════════════════════════════════════════════════

-- Producto principal: Tarjeta personalizada (con selector de diseño/postre/helado/soda)
insert into public.productos (categoria_id, nombre, precio, desc_corta, desc_larga, imagen_url, badge, visible, created_at) values
('empaques', 'Tarjeta personalizada', 2000,
 'Tarjeta de regalo personalizada para acompañar tu pedido',
 'Tarjeta de regalo con diseño floral personalizable. Escribe tu mensaje y elige el postre y sabores que quieres acompañar con tu tarjeta. Ideal para sorprender en cumpleaños y ocasiones especiales.',
 'img/empaques/tarjeta-personalizada.avif', '', true, now() - interval '60 days');

-- Insertar grupos y valores de opciones para "Tarjeta personalizada"
do $$
declare
  v_prod_id uuid;
  v_op_postre uuid;
  v_op_helado uuid;
  v_op_soda   uuid;
begin
  select id into v_prod_id from public.productos
    where nombre = 'Tarjeta personalizada' and categoria_id = 'empaques'
    limit 1;

  -- Grupo 1: Escoge el postre
  insert into public.producto_opciones (producto_id, titulo, obligatorio, orden)
    values (v_prod_id, 'Escoge el postre', true, 1)
    returning id into v_op_postre;

  insert into public.producto_opciones_valores (opcion_id, etiqueta, orden) values
    (v_op_postre, 'Fresas con Crema',    1),
    (v_op_postre, 'Cuatro Leches',       2),
    (v_op_postre, 'Cremoso de Brownie',  3);

  -- Grupo 2: Sabor de helado
  insert into public.producto_opciones (producto_id, titulo, obligatorio, orden)
    values (v_prod_id, 'Sabor de helado', true, 2)
    returning id into v_op_helado;

  insert into public.producto_opciones_valores (opcion_id, etiqueta, orden) values
    (v_op_helado, 'Yogurt',   1),
    (v_op_helado, 'Vainilla', 2);

  -- Grupo 3: Sabor de soda
  insert into public.producto_opciones (producto_id, titulo, obligatorio, orden)
    values (v_prod_id, 'Sabor de soda', true, 3)
    returning id into v_op_soda;

  insert into public.producto_opciones_valores (opcion_id, etiqueta, orden) values
    (v_op_soda, 'Frutos Rojos',               1),
    (v_op_soda, 'Caramelo Salado y Almendras', 2),
    (v_op_soda, 'Maracupiña',                  3),
    (v_op_soda, 'Frutos Amarillos',            4);
end $$;

-- ══════════════════════════════════════════════════════════════
--  Opciones de sabor para "Sodas Frutales MD" (ya existente)
-- ══════════════════════════════════════════════════════════════
do $$
declare
  v_prod_id uuid;
  v_op_sabor uuid;
begin
  select id into v_prod_id from public.productos
    where nombre = 'Sodas Frutales MD' and categoria_id = 'bebidas'
    limit 1;

  if v_prod_id is not null then
    insert into public.producto_opciones (producto_id, titulo, obligatorio, orden)
      values (v_prod_id, 'Escoge el sabor', true, 1)
      returning id into v_op_sabor;

    insert into public.producto_opciones_valores (opcion_id, etiqueta, orden) values
      (v_op_sabor, 'Fresa-limón',     1),
      (v_op_sabor, 'Maracupiña',      2),
      (v_op_sabor, 'Frutos Amarillos', 3);
  end if;
end $$;