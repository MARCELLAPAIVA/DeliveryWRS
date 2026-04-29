-- =====================================================================
-- 02_rls.sql — Row Level Security
-- Rode após 01_schema.sql
-- =====================================================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- USER_ROLES (somente admin gerencia, usuário lê o próprio)
DROP POLICY IF EXISTS "roles_select_own" ON user_roles;
CREATE POLICY "roles_select_own" ON user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "roles_admin_all" ON user_roles;
CREATE POLICY "roles_admin_all" ON user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CATEGORIES — leitura pública, escrita admin
DROP POLICY IF EXISTS "categories_select_all" ON categories;
CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "categories_admin_write" ON categories;
CREATE POLICY "categories_admin_write" ON categories FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- PRODUCTS — leitura pública, escrita admin
DROP POLICY IF EXISTS "products_select_all" ON products;
CREATE POLICY "products_select_all" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_admin_write" ON products FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- DELIVERY ZONES — leitura pública, escrita admin
DROP POLICY IF EXISTS "zones_select_all" ON delivery_zones;
CREATE POLICY "zones_select_all" ON delivery_zones FOR SELECT USING (true);
DROP POLICY IF EXISTS "zones_admin_write" ON delivery_zones;
CREATE POLICY "zones_admin_write" ON delivery_zones FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS — cliente vê só os seus, admin vê todos
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;
CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_admin_update" ON orders;
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE
  USING (public.has_role(auth.uid(),'admin'));

-- ORDER ITEMS — segue o pedido
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
  );
DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id
            AND o.user_id = auth.uid())
  );

-- SETTINGS — leitura pública, escrita admin
DROP POLICY IF EXISTS "settings_select_all" ON settings;
CREATE POLICY "settings_select_all" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "settings_admin_write" ON settings;
CREATE POLICY "settings_admin_write" ON settings FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
