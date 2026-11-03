-- Test catalogue for development. Safe to re-run: updates rows by slug.
insert into public.products
  (slug, lot, name, category, price_cents, colour, fabric, description, fit, care, sizes, art, wash, stock, is_new, sold_out, sort)
values
  ('selvedge-straight-jean', 'Lot 001', 'Selvedge straight jean', 'Jeans', 18900, 'Raw indigo', '14 oz selvedge denim', 'Our core jean. A mid rise, straight leg cut in unwashed selvedge that fades to your own creases over months of wear. Chain stitched hem and copper rivets.', 'Raw denim stretches about one size at the waist. Take your true waist or one size down.', 'Wear for six months before the first soak. Wash inside out, cold, and hang to dry.', array['26','28','30','32','34','36']::text[], 'jeans', 'raw', 14, true, false, 0),
  ('wide-leg-jean-rinse', 'Lot 002', 'Wide leg jean', 'Jeans', 20500, 'One wash', '13 oz selvedge denim', 'High rise and a full, wide leg that falls straight from the hip. Rinsed once so it is soft from day one and will not shrink further.', 'High rise. True to waist size.', 'Machine wash cold, inside out. Line dry.', array['26','28','30','32','34','36']::text[], 'jeans', 'rinse', 9, true, false, 10),
  ('tapered-jean-stone', 'Lot 003', 'Tapered jean', 'Jeans', 17500, 'Light stone', '12 oz denim', 'Roomy through the thigh and narrowing to the ankle. Stone washed by hand for a worn in, sun faded blue.', 'Relaxed top block. True to waist size.', 'Machine wash cold. Line dry.', array['26','28','30','32','34','36']::text[], 'jeans', 'light', 6, false, false, 20),
  ('selvedge-trucker-jacket', 'Lot 010', 'Selvedge trucker jacket', 'Jackets', 26500, 'Raw indigo', '14 oz selvedge denim', 'A short, boxy jacket with pleated fronts, flap chest pockets and adjuster tabs at the waist. Made from the same cloth as our straight jean.', 'Cropped and boxy. True to size, or size up to layer over knitwear.', 'Wash rarely, cold and inside out. Hang to dry.', array['XS','S','M','L','XL']::text[], 'trucker', 'raw', 11, true, false, 30),
  ('denim-chore-coat', 'Lot 011', 'Denim chore coat', 'Jackets', 29500, 'Ecru', '12 oz undyed denim', 'A workwear coat in natural, undyed denim with three patch pockets and corozo buttons. Softens and yellows slightly with age.', 'Loose. Size down for a closer fit.', 'Machine wash at 30 degrees. Line dry.', array['XS','S','M','L','XL']::text[], 'chore', 'ecru', 5, false, false, 40),
  ('lined-trucker-jacket', 'Lot 012', 'Lined trucker jacket', 'Jackets', 34500, 'One wash', '14 oz denim, wool flannel lining', 'Our trucker lined in a checked wool flannel for colder months. Rinsed once and finished with copper shank buttons.', 'Boxy. Size up to wear over a sweat.', 'Dry clean recommended.', array['XS','S','M','L','XL']::text[], 'trucker', 'rinse', 0, false, true, 50),
  ('western-denim-shirt', 'Lot 020', 'Western denim shirt', 'Shirts', 14500, 'Light wash', '8 oz denim', 'Pointed yokes, snap flap pockets and long three snap cuffs. Light enough to wear as a shirt, sturdy enough for an overshirt.', 'Regular. True to size.', 'Machine wash cold. Line dry.', array['XS','S','M','L','XL']::text[], 'western', 'light', 13, false, false, 60),
  ('chambray-work-shirt', 'Lot 021', 'Chambray work shirt', 'Shirts', 11900, 'Indigo chambray', '5 oz chambray', 'A breathable shirt woven with indigo and white yarns. Pointed yokes and pearl snaps, cut for summer.', 'Slightly relaxed. True to size.', 'Machine wash cold. Iron while damp.', array['XS','S','M','L','XL']::text[], 'western', 'rinse', 8, true, false, 70),
  ('denim-shirt-dress', 'Lot 030', 'Denim shirt dress', 'Dresses', 22500, 'Light wash', '8 oz denim', 'A belted shirt dress that buttons to the hem. Chest pocket, short sleeves and a skirt with enough room to walk freely.', 'Relaxed with a self belt. True to size.', 'Machine wash cold. Line dry.', array['XS','S','M','L']::text[], 'dress', 'light', 4, false, false, 80),
  ('button-front-midi-skirt', 'Lot 031', 'Button front midi skirt', 'Skirts', 15900, 'Raw indigo', '12 oz denim', 'An A line midi with copper buttons from waist to hem. Leave the lower buttons open for a slit.', 'High waisted. True to waist size.', 'Wash cold, inside out. Line dry.', array['26','28','30','32','34']::text[], 'skirt', 'raw', 7, false, false, 90),
  ('selvedge-overalls', 'Lot 040', 'Selvedge overalls', 'Overalls', 24500, 'One wash', '12 oz selvedge denim', 'Classic bib overalls with adjustable straps, a bib pocket and side button openings. Cut wide and comfortable.', 'Generous. Size down if between sizes.', 'Machine wash cold. Line dry.', array['XS','S','M','L','XL']::text[], 'overalls', 'rinse', 10, false, false, 100),
  ('indigo-loopback-sweat', 'Lot 050', 'Indigo loopback sweat', 'Sweats', 13500, 'Rope dyed indigo', 'Loopback cotton', 'A heavy crew neck sweat knit on slow loopback machines and dyed with indigo, so it fades just like your jeans.', 'Relaxed. True to size.', 'Wash cold with darks. Dry flat.', array['XS','S','M','L','XL']::text[], 'sweat', 'rinse', 16, false, false, 110)
on conflict (slug) do update set
  lot = excluded.lot, name = excluded.name, category = excluded.category,
  price_cents = excluded.price_cents, colour = excluded.colour, fabric = excluded.fabric,
  description = excluded.description, fit = excluded.fit, care = excluded.care,
  sizes = excluded.sizes, art = excluded.art, wash = excluded.wash, stock = excluded.stock,
  is_new = excluded.is_new, sold_out = excluded.sold_out, sort = excluded.sort;

-- Named picture slots the admin can fill
insert into public.site_images (key, label, alt) values
  ('hero', 'Home page hero (replaces the engraving when set)', ''),
  ('campaign', 'Campaign banner in the craft section', ''),
  ('og', 'Social sharing image', '')
on conflict (key) do nothing;

-- Test subscribers
insert into public.subscribers (email, source) values
  ('test.subscriber.one@example.com', 'seed'),
  ('test.subscriber.two@example.com', 'seed')
on conflict (email) do nothing;
