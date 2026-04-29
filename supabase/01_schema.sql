-- =====================================================================
-- 01_schema.sql — Estrutura do banco
-- Whiskeria Royal Salute — Delivery
-- Rode este arquivo PRIMEIRO no SQL Editor do Supabase.
-- =====================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- ROLES (admin x cliente) — tabela separada (NUNCA na profiles)
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'cliente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS user_roles (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      app_role NOT NULL DEFAULT 'cliente',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Função SECURITY DEFINER para evitar recursão de RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

-- ---------------------------------------------------------------------
-- PROFILES (dados do cliente)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        text NOT NULL DEFAULT '',
  telefone    text,
  endereco    text,
  bairro      text,
  complemento text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Trigger: cria profile + role 'cliente' automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome',''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'cliente');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  icon       text,
  image_url  text,
  sort_order int DEFAULT 0,
  active     boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE,
  name        text NOT NULL,
  description text DEFAULT '',
  price       numeric(10,2) NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url   text,
  active      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- ---------------------------------------------------------------------
-- DELIVERY ZONES (bairros e taxa)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_zones (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bairro     text UNIQUE NOT NULL,
  taxa       numeric(10,2) NOT NULL DEFAULT 0,
  active     boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('novo','em_preparo','saiu_entrega','finalizado','cancelado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('dinheiro','cartao','pix');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS orders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero        serial UNIQUE,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_nome  text NOT NULL,
  telefone      text,
  endereco      text,
  bairro        text,
  complemento   text,
  pagamento     payment_method NOT NULL,
  troco_para    numeric(10,2),
  observacoes   text,
  subtotal      numeric(10,2) NOT NULL DEFAULT 0,
  taxa_entrega  numeric(10,2) NOT NULL DEFAULT 0,
  total         numeric(10,2) NOT NULL DEFAULT 0,
  status        order_status NOT NULL DEFAULT 'novo',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ---------------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price   numeric(10,2) NOT NULL,
  quantity     int NOT NULL DEFAULT 1,
  subtotal     numeric(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ---------------------------------------------------------------------
-- SETTINGS (loja)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value text
);

INSERT INTO settings (key, value) VALUES
  ('nome_loja',  'Whiskeria Royal Salute'),
  ('whatsapp',   '5521985529198'),
  ('logo_url',   ''),
  ('banner_url', ''),
  ('descricao',  'Depósito de bebidas com os melhores rótulos nacionais e importados. Entrega rápida na sua porta.')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
